import {cache} from 'gs-tools/export/data';
import {arrayOfType, hasPropertiesType, intersectType, unknownType} from 'gs-types';
import {Context, icall, ievent, irect, itarget, ivalue, LINE, ocase, oforeach, query, registerCustomElement, renderElement, RenderSpec, SVG} from 'persona';
import {combineLatest, EMPTY, merge, Observable, of} from 'rxjs';
import {filter, map, switchMap, withLatestFrom} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {LineId, lineIdType} from '../id/line-id';
import {StampId, stampIdType} from '../id/stamp-id';
import {$getLineRenderSpec$, LineRenderSpec} from '../renderspec/render-line-spec';
import {$getStampRenderSpec$} from '../renderspec/render-stamp-spec';

import {LineActionInput, LINE_ACTION_INPUT_TYPE, LINE_CONFIG_TYPE, lineActionFactory} from './line-action';
import {HalfLineState, PadContentState, PadContentType, PadState} from './pad-state';
import template from './pad.html';
import {stampActionFactory, StampActionInput, STAMP_ACTION_INPUT_TYPE, STAMP_CONFIG_TYPE} from './stamp-action';

export interface StampGenericActionInput extends StampActionInput {
  readonly stampId: StampId<unknown>;
}
const STAMP_GENERIC_ACTION_INPUT_TYPE = intersectType([
  hasPropertiesType({stampId: stampIdType(unknownType)}),
  STAMP_ACTION_INPUT_TYPE,
]);

export interface LineGenericActionInput extends LineActionInput {
  readonly lineId: LineId<unknown>;
}
const LINE_GENERIC_ACTION_INPUT_TYPE = intersectType([
  hasPropertiesType({lineId: lineIdType(unknownType)}),
  LINE_ACTION_INPUT_TYPE,
]);

type RenderContentFn = (state: PadContentState) => RenderSpec|null;
type RenderHalfLineFn = (state: HalfLineState|null) => RenderSpec|null;

const $pad = {
  host: {
    ...create$baseComponent<PadState>().host,
    lineConfigs: ivalue('lineConfigs', arrayOfType(LINE_CONFIG_TYPE)),
    line: icall<[LineGenericActionInput], 'line'>('line', [LINE_GENERIC_ACTION_INPUT_TYPE]),
    stampConfigs: ivalue('stampConfigs', arrayOfType(STAMP_CONFIG_TYPE)),
    stamp: icall<[StampGenericActionInput], 'stamp'>('stamp', [STAMP_GENERIC_ACTION_INPUT_TYPE]),
  },
  shadow: {
    root: query('#root', SVG, {
      target: itarget(),
      contents: oforeach<readonly [PadContentState, RenderContentFn]>(
          '#contents',
          ([state]) => state,
      ),
      halfLine: ocase<readonly [HalfLineState|null, RenderHalfLineFn]>(
          '#halfLine',
          ([state]) => state,
      ),
      rect: irect(),
      onMouseMove: ievent('mousemove', MouseEvent),
    }),
  },
};
export class PadCtrl extends BaseComponent<PadState> {

  constructor(private readonly $: Context<typeof $pad>) {
    super($, 'Pad');
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.setupLineActions(),
      this.setupStampActions(),
      this.renderContents$,
      this.renderHalfLine$,
    ];
  }

  @cache()
  private get renderContents$(): Observable<unknown> {
    return combineLatest([
      this.state.$('contents'),
      this.getRenderFn$,
    ])
        .pipe(
            map(([contents, renderFn]) => contents.map(content => [content, renderFn] as const)),
            this.$.shadow.root.contents(([content, renderFn]) => renderFn(content)),
        );
  }

  @cache()
  private get renderHalfLine$(): Observable<unknown> {
    const mouseLocation$ = this.$.shadow.root.onMouseMove.pipe(
        withLatestFrom(this.$.shadow.root.rect),
        map(([event, rect]) => {
          return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
        }),
    );

    return combineLatest([
      this.state.$('halfLine'),
      $getLineRenderSpec$.get(this.$.vine).pipe(
          map(renderFn => {
            return (halfLine: HalfLineState|null) => {
              if (!halfLine) {
                return null;
              }

              return this.renderLine(
                  renderFn(halfLine.lineId),
                  of(halfLine.x1),
                  of(halfLine.y1),
                  mouseLocation$.pipe(map(({x}) => x)),
                  mouseLocation$.pipe(map(({y}) => y)),
              );
            };
          }),
      ),
    ])
        .pipe(
            this.$.shadow.root.halfLine(([halfLine, renderFn]) => renderFn(halfLine)),
        );
  }

  @cache()
  private get getRenderFn$(): Observable<RenderContentFn> {
    return combineLatest([
      $getStampRenderSpec$.get(this.$.vine),
      $getLineRenderSpec$.get(this.$.vine),
    ])
        .pipe(
            map(([stampRenderFn, lineRenderFn]) => {
              return (state: PadContentState) => {
                switch (state.type) {
                  case PadContentType.STAMP:
                    return stampRenderFn(state);
                  case PadContentType.LINE:
                    return this.renderLine(
                        lineRenderFn(state.lineId),
                        of(state.x1),
                        of(state.y1),
                        of(state.x2),
                        of(state.y2),
                    );
                }
              };
            }),
        );
  }

  private renderLine(
      lineRenderSpec: LineRenderSpec|null,
      x1$: Observable<number>,
      y1$: Observable<number>,
      x2$: Observable<number>,
      y2$: Observable<number>,
  ): RenderSpec {
    return renderElement({
      registration: LINE,
      spec: {},
      runs: $ => {
        const obsList: Array<Observable<unknown>> = [
          x1$.pipe($.x1()),
          y1$.pipe($.y1()),
          x2$.pipe($.x2()),
          y2$.pipe($.y2()),
        ];
        if (!lineRenderSpec) {
          return obsList;
        }

        if (lineRenderSpec.pathLength) {
          obsList.push(lineRenderSpec.pathLength.pipe($.pathLength()));
        }

        if (lineRenderSpec.stroke) {
          obsList.push(lineRenderSpec.stroke.pipe($.stroke()));
        }

        if (lineRenderSpec.strokeDasharray) {
          obsList.push(lineRenderSpec.strokeDasharray.pipe($.strokeDasharray()));
        }

        if (lineRenderSpec.strokeLinecap) {
          obsList.push(lineRenderSpec.strokeLinecap.pipe($.strokeLinecap()));
        }

        if (lineRenderSpec.strokeOpacity) {
          obsList.push(lineRenderSpec.strokeOpacity.pipe($.strokeOpacity()));
        }

        if (lineRenderSpec.strokeWidth) {
          obsList.push(lineRenderSpec.strokeWidth.pipe($.strokeWidth()));
        }

        return obsList;
      },
    });

  }

  private setupLineActions(): Observable<unknown> {
    return this.$.host.lineConfigs.pipe(
        switchMap(configs => {
          if (!configs) {
            return EMPTY;
          }

          const registrations = configs.map(config => this.installAction(
              lineActionFactory(config),
              config.lineName,
              this.$.shadow.root.target,
              of(config),
              this.$.host.line.pipe(filter(([arg]) => arg.lineId === config.lineId)),
          ));

          return merge(...registrations);
        }),
    );
  }

  private setupStampActions(): Observable<unknown> {
    return this.$.host.stampConfigs.pipe(
        switchMap(configs => {
          if (!configs) {
            return EMPTY;
          }

          const registrations = configs.map(config => this.installAction(
              stampActionFactory(config),
              config.stampName,
              this.$.shadow.root.target,
              of(config),
              this.$.host.stamp.pipe(filter(([arg]) => arg.stampId === config.stampId)),
          ));

          return merge(...registrations);
        }),
    );
  }
}

export const PAD = registerCustomElement({
  ctrl: PadCtrl,
  spec: $pad,
  tag: 'pb-pad',
  template,
});