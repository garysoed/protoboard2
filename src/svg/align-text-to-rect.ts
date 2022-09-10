import {mapNullableTo} from 'gs-tools/export/rxjs';
import {enumType, hasPropertiesType, Type} from 'gs-types';
import {Anchor, AnchorSpec} from 'mask';
import {reverse} from 'nabu';
import {AlignmentBaseline, iattr, numberParser, oattr, stringEnumParser, TextAnchor} from 'persona';
import { } from 'persona/src/parser/string-enum-parser';
import {combineLatest, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

export interface AlignSpec {
  readonly rect: AnchorSpec;
  readonly text: AnchorSpec;
}

const ANCHOR_TYPE = enumType<Anchor>(Anchor);

const ANCHOR_SPEC_TYPE = hasPropertiesType<AnchorSpec>({
  horizontal: ANCHOR_TYPE,
  vertical: ANCHOR_TYPE,
});

export const ALIGN_SPEC_TYPE: Type<AlignSpec> = hasPropertiesType({
  rect: ANCHOR_SPEC_TYPE,
  text: ANCHOR_SPEC_TYPE,
});

interface Args {
  readonly anchorSpec: AlignSpec;
  readonly rect$: Observable<SVGRectElement>;
  readonly text$: Observable<SVGTextElement>;
}

export function alignTextToRect(args: Args): ReadonlyArray<Observable<unknown>> {
  const rectX$ = args.rect$.pipe(
      switchMap(rect => iattr('x', numberParser()).resolve(rect)),
      mapNullableTo(0),
  );
  const rectWidth$ = args.rect$.pipe(
      switchMap(rect => iattr('width', numberParser()).resolve(rect)),
      mapNullableTo(0),
  );
  const rectY$ = args.rect$.pipe(
      switchMap(rect => iattr('y', numberParser()).resolve(rect)),
      mapNullableTo(0),
  );
  const rectHeight$ = args.rect$.pipe(
      switchMap(rect => iattr('height', numberParser()).resolve(rect)),
      mapNullableTo(0),
  );

  const textX$ = args.text$.pipe(map(text => oattr('x', reverse(numberParser())).resolve(text)));
  const textY$ = args.text$.pipe(map(text => oattr('y', reverse(numberParser())).resolve(text)));
  const textAlignmentBaseline$ = args.text$.pipe(
      map(text => {
        return oattr(
            'alignment-baseline',
            reverse(stringEnumParser<AlignmentBaseline>(AlignmentBaseline)),
        ).resolve(text);
      }),
  );
  const textAnchor$ = args.text$.pipe(
      map(text => {
        return oattr('text-anchor', reverse(stringEnumParser<TextAnchor>(TextAnchor)))
            .resolve(text);
      }),
  );

  return [
    combineLatest([rectX$, rectWidth$])
        .pipe(
            map(([rectX, rectWidth]) => {
              switch (args.anchorSpec.rect.horizontal) {
                case Anchor.START:
                  return rectX;
                case Anchor.MIDDLE:
                  return rectX + rectWidth / 2;
                case Anchor.END:
                  return rectX + rectWidth;
              }
            }),
            applyFn(textX$),
        ),
    combineLatest([ rectY$, rectHeight$ ])
        .pipe(
            map(([rectY, rectHeight]) => {
              switch (args.anchorSpec.rect.vertical) {
                case Anchor.START:
                  return rectY;
                case Anchor.MIDDLE:
                  return rectY + rectHeight / 2;
                case Anchor.END:
                  return rectY + rectHeight;
              }
            }),
            applyFn(textY$),
        ),
    of(getAlignmentBaseline(args.anchorSpec.text.vertical)).pipe(applyFn(textAlignmentBaseline$)),
    of(getTextAnchor(args.anchorSpec.text.horizontal)).pipe(applyFn(textAnchor$)),
  ];
}

function getAlignmentBaseline(anchor: Anchor): AlignmentBaseline {
  switch (anchor) {
    case Anchor.START:
      return AlignmentBaseline.TEXT_BEFORE_EDGE;
    case Anchor.MIDDLE:
      return AlignmentBaseline.MIDDLE;
    case Anchor.END:
      return AlignmentBaseline.TEXT_AFTER_EDGE;
  }
}

function getTextAnchor(anchor: Anchor): TextAnchor {
  switch (anchor) {
    case Anchor.START:
      return TextAnchor.START;
    case Anchor.MIDDLE:
      return TextAnchor.MIDDLE;
    case Anchor.END:
      return TextAnchor.END;
  }
}

function applyFn<F, T>(operator$: Observable<() => OperatorFunction<F, T>>): OperatorFunction<F, T> {
  return pipe(
      switchMap(value => {
        return operator$.pipe(
            switchMap(operator => of(value).pipe(operator())),
        );
      }),
  );
}