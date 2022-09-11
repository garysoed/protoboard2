import {enumType, hasPropertiesType, Type} from 'gs-types';
import {Anchor, AnchorSpec} from 'mask';
import {reverse} from 'nabu';
import {AlignmentBaseline, numberParser, oattr, oforeach, otext, renderElement, stringEnumParser, TextAnchor, TSPAN} from 'persona';
import {ElementNamespace, RenderContext} from 'persona/export/internal';
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
  readonly lineHeight$: Observable<number>;
  readonly rect$: Observable<SVGRectElement>;
  readonly text$: Observable<SVGTextElement>;
  readonly context: RenderContext;
}

interface LineWithIndex {
  readonly line: string;
  readonly index: number;
}

export function renderSvgText(args: Args): ReadonlyArray<Observable<unknown>> {
  const rectY$ = args.rect$.pipe(map(rect => rect.y.baseVal.value));
  const rectHeight$ = args.rect$.pipe(map(rect => rect.height.baseVal.value));
  const rectWidth$ = args.rect$.pipe(map(rect => rect.width.baseVal.value));
  const textX$ = combineLatest([
    args.rect$.pipe(map(rect => rect.x.baseVal.value)),
    rectWidth$,
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
  const lines$ = combineLatest([
    args.content$,
    args.text$,
    rectWidth$,
  ])
      .pipe(
          map(([content, textEl, maxWidth]) => {
            const lines = content.split('\n');
            const testSpan = args.context.document.createElementNS(ElementNamespace.SVG, 'tspan');
            textEl.appendChild(testSpan);
            const fitLines: string[] = [];
            for (const line of lines) {
              const candidates: string[] = [];
              const words = line.split(' ');
              for (const word of words) {
                testSpan.textContent = [...candidates, word].join(' ');
                if (testSpan.getBBox().width > maxWidth) {
                  fitLines.push(candidates.join(' '));
                  candidates.splice(0, candidates.length, word);
                } else {
                  candidates.push(word);
                }
              }

              fitLines.push(candidates.join(' '));
            }

            textEl.removeChild(testSpan);

            return fitLines.map((line, index) => ({line, index}));
          }),
      );

  return [
    combineLatest([rectY$, rectHeight$, lines$, args.lineHeight$])
        .pipe(
            map(([rectY, rectHeight, lines, lineHeight]) => {
              switch (args.anchorSpec.rect.vertical) {
                case Anchor.START:
                  return rectY;
                case Anchor.MIDDLE:
                  return rectY + rectHeight / 2 - (lines.length - 1) * lineHeight / 2;
                case Anchor.END:
                  return rectY + rectHeight - (lines.length - 1) * lineHeight;
              }
            }),
            applyFn(otextY$),
        ),

    of(getTextAnchor(args.anchorSpec.text.horizontal)).pipe(applyFn(otextAnchor$)),
    combineLatest([
      args.text$.pipe(
          map(text => oforeach<LineWithIndex>().resolve(text, args.context)),
      ),
      args.lineHeight$,
    ])
        .pipe(
            switchMap(([ocontent, lineHeight]) => {
              return lines$.pipe(
                  ocontent(map(({line, index}) => renderElement({
                    registration: TSPAN,
                    spec: {
                      content: otext(),
                    },
                    runs: $ => [
                      of(line).pipe($.content()),
                      textX$.pipe($.x()),
                      of(getAlignmentBaseline(args.anchorSpec.text.vertical))
                          .pipe($.alignmentBaseline()),
                      of(index === 0 ? 0 : lineHeight).pipe($.dy()),
                    ],
                  }))),
              );
            }),
        ),
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