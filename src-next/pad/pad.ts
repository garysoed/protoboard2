import {arrayOfType, hasPropertiesType, intersectType, unknownType} from 'gs-types';
import {Context, icall, itarget, ivalue, query, registerCustomElement, SVG} from 'persona';
import {EMPTY, Observable, of, merge} from 'rxjs';
import {switchMap, filter} from 'rxjs/operators';

import {BaseComponent, create$baseComponent} from '../core/base-component';
import {StampId, stampIdType} from '../id/stamp-id';

import {PadState} from './pad-state';
import template from './pad.html';
import {stampActionFactory, StampActionInput, STAMP_ACTION_INPUT_TYPE, STAMP_CONFIG_TYPE} from './stamp-action';

export interface StampGenericActionInput extends StampActionInput {
  readonly stampId: StampId<unknown>;
}

const STAMP_GENERIC_ACTION_INPUT_TYPE = intersectType([
  hasPropertiesType({stampId: stampIdType(unknownType)}),
  STAMP_ACTION_INPUT_TYPE,
]);

const $pad = {
  host: {
    ...create$baseComponent<PadState>().host,
    stampConfigs: ivalue('stampConfigs', arrayOfType(STAMP_CONFIG_TYPE)),
    stamp: icall<[StampGenericActionInput], 'stamp'>('stamp', [STAMP_GENERIC_ACTION_INPUT_TYPE]),
  },
  shadow: {
    root: query('#root', SVG, {
      target: itarget(),
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
      this.setupStampActions(),
      // this.renderers.root.permanents(this.permanents$),
      // this.renderers.root.halfline(this.halfline$),
    ];
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

  // @cache()
  // private get halfline$(): Observable<RenderSpec|null> {
  //   return this.stateService._(this.inputs.host.objectPath).$('halfLine').pipe(
  //       withLatestFrom($canvasConfigService.get(this.vine).lineConfig$),
  //       switchMap(([halfLine, lineConfigs]) => {
  //         if (!halfLine) {
  //           return of(null);
  //         }

  //         return fromEvent<MouseEvent>(window, 'mousemove').pipe(
  //             withLatestFrom(this.inputs.root.boundingRect),
  //             switchMap(([event, rect]) => {
  //               const spec = this.renderLine(
  //                   {
  //                     ...halfLine,
  //                     toX: event.clientX - rect.x,
  //                     toY: event.clientY - rect.y,
  //                   },
  //                   lineConfigs,
  //               );

  //               return spec ?? of(null);
  //             }),
  //             startWith(null),
  //         );
  //       }),
  //       map(node => {
  //         if (!node) {
  //           return null;
  //         }

  //         return renderNode({node, id: {}});
  //       }),
  //   );
  // }

  // @cache()
  // private get permanents$(): Observable<readonly RenderSpec[]> {
  //   const canvasConfigService = $canvasConfigService.get(this.vine);
  //   return combineLatest([
  //     this.stateService._(this.inputs.host.objectPath).$('icons'),
  //     this.stateService._(this.inputs.host.objectPath).$('lines'),
  //   ]).pipe(
  //       withLatestFrom(
  //           canvasConfigService.iconConfig$,
  //           canvasConfigService.lineConfig$,
  //       ),
  //       switchMap(([[icons, lines], iconConfigs, lineConfigs]) => {
  //         const renderIconEls = $pipe(
  //             icons ?? [],
  //             $map(icon => this.renderIcon(icon, iconConfigs)),
  //             $filterNonNull(),
  //             $asArray(),
  //         );

  //         const renderLineEls = $pipe(
  //             lines ?? [],
  //             $map(line => this.renderLine(line, lineConfigs)),
  //             $filterNonNull(),
  //             $asArray(),
  //         );

  //         const nodeObsList = [...renderIconEls, ...renderLineEls];

  //         if (nodeObsList.length <= 0) {
  //           return of([]);
  //         }

  //         return combineLatest(
  //             nodeObsList.map(node$ => node$.pipe(map(node => renderNode({node, id: {}})))),
  //         );
  //       }),
  //   );
  // }

  // private renderIcon(
  //     icon: CanvasIcon,
  //     iconConfigs: ReadonlyMap<string, IconConfig>,
  // ): Observable<Node>|null {
  //   const config = iconConfigs.get(icon.configName);
  //   if (!config) {
  //     return null;
  //   }

  //   return $svgService.get(this.vine).getSvg(config.svgName).pipe(
  //       switchMap(svgContent => {
  //         if (!svgContent) {
  //           return of(
  //               this.context.shadowRoot.ownerDocument.createComment(`unknown SVG: ${config.svgName}`),
  //           );
  //         }

  //         return renderSvg({
  //           type: 'template',
  //           document: this.context.shadowRoot.ownerDocument,
  //           content: svgContent,
  //           x: `${icon.x}`,
  //           y: `${icon.y}`,
  //           width: `${icon.width}`,
  //           height: `${icon.height}`,
  //         });
  //       }),
  //   );
  // }

  // private renderLine(
  //     line: CanvasLine,
  //     lineConfigs: ReadonlyMap<string, LineConfig>,
  // ): Observable<Node>|null {
  //   const config = lineConfigs.get(line.configName);
  //   if (!config) {
  //     return null;
  //   }
  //   return renderSvg({
  //     type: 'line',
  //     document: this.context.shadowRoot.ownerDocument,
  //     x1: `${line.fromX}`,
  //     x2: `${line.toX}`,
  //     y1: `${line.fromY}`,
  //     y2: `${line.toY}`,
  //     stroke: config.color,
  //     strokeDasharray: config.dashArray,
  //     strokeDashoffset: config.dashOffset,
  //     strokeLinecap: config.linecap,
  //     strokeWidth: config.width,
  //   });
  // }
}

export const PAD = registerCustomElement({
  ctrl: PadCtrl,
  spec: $pad,
  tag: 'pb-pad',
  template,
});