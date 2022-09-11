import {enumType, hasPropertiesType, Type} from 'gs-types';
import {Anchor, AnchorSpec} from 'mask';
import {reverse} from 'nabu';
import {AlignmentBaseline, numberParser, oattr, oforeach, otext, renderElement, stringEnumParser, TextAnchor, TSPAN} from 'persona';
import {RenderContext} from 'persona/export/internal';
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
  readonly content$: Observable<string>;
  readonly rect$: Observable<SVGRectElement>;
  readonly text$: Observable<SVGTextElement>;
  readonly context: RenderContext;
}

export function renderSvgText(args: Args): ReadonlyArray<Observable<unknown>> {
  const rectY$ = args.rect$.pipe(map(rect => rect.y.baseVal.value));
  const rectHeight$ = args.rect$.pipe(map(rect => rect.height.baseVal.value));
  const textX$ = combineLatest([
    args.rect$.pipe(map(rect => rect.x.baseVal.value)),
    args.rect$.pipe(map(rect => rect.width.baseVal.value)),
  ])
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
      );

  const otextY$ = args.text$.pipe(map(text => oattr('y', reverse(numberParser())).resolve(text)));
  const otextAnchor$ = args.text$.pipe(
      map(text => {
        return oattr('text-anchor', reverse(stringEnumParser<TextAnchor>(TextAnchor)))
            .resolve(text);
      }),
  );

  return [
    combineLatest([rectY$, rectHeight$])
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
            applyFn(otextY$),
        ),

    of(getTextAnchor(args.anchorSpec.text.horizontal)).pipe(applyFn(otextAnchor$)),
    args.content$.pipe(
        switchMap(content => {
          const ocontent$ = args.text$.pipe(
              map(text => oforeach<string>().resolve(text, args.context)),
          );

          return ocontent$.pipe(
              switchMap(ocontent => {
                return of([content]).pipe(
                    ocontent(map(line => renderElement({
                      registration: TSPAN,
                      spec: {
                        content: otext(),
                      },
                      runs: $ => [
                        of(line).pipe($.content()),
                        textX$.pipe($.x()),
                        of(getAlignmentBaseline(args.anchorSpec.text.vertical))
                            .pipe($.alignmentBaseline()),
                      ],
                    }))),
                );
              }),
          );
        })),
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