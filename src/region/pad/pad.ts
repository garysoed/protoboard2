import {$asMap, $map} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {$pipe} from 'gs-tools/export/typescript';
import {arrayOfType, hasPropertiesType, instanceofType, intersectType, stringType, Type} from 'gs-types';
import {Context, icall, ievent, irect, itarget, ivalue, Length, LINE, LineCap, ocase, oforeach, ParseType, query, registerCustomElement, renderElement, RenderElementSpec, RenderSpec, RenderStringSpec, SVG} from 'persona';
import {combineLatest, EMPTY, merge, Observable, of} from 'rxjs';
import {filter, map, startWith, switchMap, withLatestFrom} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../../core/base-component';
import {TriggerSpec, TriggerType, TRIGGER_SPEC_TYPE} from '../../types/trigger-spec';


import {lineActionFactory, LineActionInput, LINE_ACTION_INPUT_TYPE} from './line-action';
import {HalfLineState, PadContentState, PadContentType, PadState, PAD_STATE_TYPE, StampState} from './pad-state';
import template from './pad.html';
import {stampActionFactory, StampActionInput, STAMP_ACTION_INPUT_TYPE} from './stamp-action';
import {undoAction} from './undo-action';


export interface LineRenderSpec {
  readonly pathLength?: Observable<Length>;
  readonly stroke?: Observable<string>;
  readonly strokeDasharray?: Observable<readonly Length[]>;
  readonly strokeLinecap?: Observable<LineCap>;
  readonly strokeOpacity?: Observable<number>;
  readonly strokeWidth?: Observable<Length>;
}

export type StampRenderSpec = RenderElementSpec<any, any, SVGElement>|
    RenderStringSpec<ParseType.SVG, any>|null;

interface LineConfig extends TriggerSpec {
  readonly lineId: string;
  readonly lineName: string;
  readonly renderFn: () => LineRenderSpec;
}

export const LINE_CONFIG_TYPE: Type<LineConfig> = intersectType([
  TRIGGER_SPEC_TYPE,
  hasPropertiesType({
    lineId: stringType,
    lineName: stringType,
    renderFn: instanceofType<() => LineRenderSpec>(Function),
  }),
]);


interface StampConfig extends TriggerSpec {
  readonly stampId: string;
  readonly stampName: string;
  readonly renderFn: (state: StampState) => StampRenderSpec;
}

export const STAMP_CONFIG_TYPE: Type<StampConfig> = intersectType([
  TRIGGER_SPEC_TYPE,
  hasPropertiesType({
    stampId: stringType,
    stampName: stringType,
    renderFn: instanceofType<(state: StampState) => StampRenderSpec>(Function),
  }),
]);

export interface StampGenericActionInput extends StampActionInput {
  readonly stampId: string;
}
const STAMP_GENERIC_ACTION_INPUT_TYPE = intersectType([
  hasPropertiesType({stampId: stringType}),
  STAMP_ACTION_INPUT_TYPE,
]);

export interface LineGenericActionInput extends LineActionInput {
  readonly lineId: string;
}
const LINE_GENERIC_ACTION_INPUT_TYPE = intersectType([
  hasPropertiesType({lineId: stringType}),
  LINE_ACTION_INPUT_TYPE,
]);

type RenderContentFn = (state: PadContentState) => RenderSpec|null;
type RenderHalfLineFn = (state: HalfLineState|null) => RenderSpec|null;

const $pad = {
  host: {
    ...create$baseComponent<PadState>(PAD_STATE_TYPE).host,
    lineConfigs: ivalue('lineConfigs', arrayOfType(LINE_CONFIG_TYPE)),
    line: icall<[LineGenericActionInput], 'line'>('line', [LINE_GENERIC_ACTION_INPUT_TYPE]),
    stampConfigs: ivalue('stampConfigs', arrayOfType(STAMP_CONFIG_TYPE)),
    stamp: icall<[StampGenericActionInput], 'stamp'>('stamp', [STAMP_GENERIC_ACTION_INPUT_TYPE]),
    undoConfig: ivalue('undoConfig', TRIGGER_SPEC_TYPE, () => ({type: TriggerType.BACKSPACE})),
    undo: icall<[], 'undo'>('undo', []),
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

  @cache()
  private get lineConfigsMap$(): Observable<ReadonlyMap<string, LineConfig>> {
    return this.$.host.lineConfigs.pipe(
        map(configs => $pipe(
            configs ?? [],
            $map(config => [config.lineId, config] as const),
            $asMap(),
        )),
    );
  }

  @cache()
  private get stampConfigsMap$(): Observable<ReadonlyMap<string, StampConfig>> {
    return this.$.host.stampConfigs.pipe(
        map(configs => $pipe(
            configs ?? [],
            $map(config => [config.stampId, config] as const),
            $asMap(),
        )),
    );
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.setupLineActions(),
      this.setupStampActions(),
      this.installAction(
          undoAction,
          'Undo',
          this.$.shadow.root.target,
          this.$.host.undoConfig,
          this.$.host.undo,
      ),
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
            this.$.shadow.root.contents(map(([content, renderFn]) => renderFn(content))),
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
      this.lineConfigsMap$.pipe(
          map(configsMap => {
            return (halfLine: HalfLineState|null) => {
              if (!halfLine) {
                return null;
              }

              const config = configsMap.get(halfLine.lineId);
              if (!config) {
                return null;
              }

              return this.renderLine(
                  config.renderFn(),
                  of(halfLine.x1),
                  of(halfLine.y1),
                  mouseLocation$.pipe(map(({x}) => x), startWith(halfLine.x1)),
                  mouseLocation$.pipe(map(({y}) => y), startWith(halfLine.y1)),
              );
            };
          }),
      ),
    ])
        .pipe(
            this.$.shadow.root.halfLine(map(([halfLine, renderFn]) => renderFn(halfLine))),
        );
  }

  @cache()
  private get getRenderFn$(): Observable<RenderContentFn> {
    return combineLatest([
      this.stampConfigsMap$,
      this.lineConfigsMap$,
    ])
        .pipe(
            map(([stampConfigsMap, lineConfigsMap]) => {
              return (state: PadContentState) => {
                switch (state.type) {
                  case PadContentType.STAMP: {
                    const stampConfig = stampConfigsMap.get(state.stampId);
                    if (!stampConfig) {
                      return null;
                    }
                    return stampConfig.renderFn(state);
                  }
                  case PadContentType.LINE: {
                    const lineConfig = lineConfigsMap.get(state.lineId);
                    if (!lineConfig) {
                      return null;
                    }
                    return this.renderLine(
                        lineConfig.renderFn(),
                        of(state.x1),
                        of(state.y1),
                        of(state.x2),
                        of(state.y2),
                    );
                  }
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
              lineActionFactory(config, this.$.shadow.root.target),
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
              stampActionFactory(config, this.$.shadow.root.target),
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