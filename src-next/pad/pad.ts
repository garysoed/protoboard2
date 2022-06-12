import {Context, query, registerCustomElement, SVG} from 'persona';
import {Observable} from 'rxjs';

import {BaseComponent, create$baseComponent} from '../core/base-component';

import {PadState} from './pad-state';
import template from './pad.html';


const $pad = {
  host: {
    ...create$baseComponent().host,
  },
  root: query('#root', SVG, {
  }),
};
export class PadCtrl extends BaseComponent<PadState> {

  constructor($: Context<typeof $pad>) {
    super($, 'Pad');
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      // this.renderers.root.permanents(this.permanents$),
      // this.renderers.root.halfline(this.halfline$),
    ];
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