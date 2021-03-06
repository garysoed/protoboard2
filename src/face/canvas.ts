import {renderSvg} from 'almagest';
import {$stateService} from 'grapevine';
import {$asArray, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {Modifier} from 'gs-tools/export/state';
import {$svgService, BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {$svg, attributeIn, boundingRect, element, host, multi, PersonaContext, renderNode, RenderSpec, single} from 'persona';
import {combineLatest, fromEvent, Observable, of} from 'rxjs';
import {map, startWith, switchMap, withLatestFrom} from 'rxjs/operators';

import {IconConfig, LineConfig} from './canvas-config';
import {$canvasConfigService} from './canvas-config-service';
import {CanvasEntry, CanvasIcon, CanvasLine} from './canvas-entry';
import template from './canvas.html';


// TODO: Add warnings for missing configs.
export const $canvas = {
  tag: 'pb-canvas',
  api: {
    objectId: attributeIn('object-id', stateIdParser<CanvasEntry>()),
  },
};

export function canvasSpec(partial: Partial<CanvasEntry>, x: Modifier): CanvasEntry {
  return {
    icons: partial.icons ?? x.add([]),
    lines: partial.lines ?? x.add([]),
    halfLine: partial.halfLine ?? x.add(null),
  };
}

export const $ = {
  host: host($canvas.api),
  root: element('root', $svg, {
    boundingRect: boundingRect(),
    halfline: single('#halfline'),
    permanents: multi('#permanents'),
  }),
};

@_p.customElement({
  ...$canvas,
  template,
})
export class Canvas extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.permanents(this.permanents$),
      this.renderers.root.halfline(this.halfline$),
    ];
  }

  @cache()
  private get halfline$(): Observable<RenderSpec|null> {
    return this.inputs.host.objectId.pipe(
        switchMap(objectId => {
          if (!objectId) {
            return of(null);
          }

          return $stateService.get(this.vine).resolve(objectId).$('halfLine');
        }),
        withLatestFrom($canvasConfigService.get(this.vine).lineConfig$),
        switchMap(([halfLine, lineConfigs]) => {
          if (!halfLine) {
            return of(null);
          }

          return fromEvent<MouseEvent>(window, 'mousemove').pipe(
              withLatestFrom(this.inputs.root.boundingRect),
              switchMap(([event, rect]) => {
                const spec = this.renderLine(
                    {
                      ...halfLine,
                      toX: event.clientX - rect.x,
                      toY: event.clientY - rect.y,
                    },
                    lineConfigs,
                );

                return spec ?? of(null);
              }),
              startWith(null),
          );
        }),
        map(node => {
          if (!node) {
            return null;
          }

          return renderNode({node, id: {}});
        }),
    );

  }

  @cache()
  private get permanents$(): Observable<readonly RenderSpec[]> {
    const canvasConfigService = $canvasConfigService.get(this.vine);
    return this.inputs.host.objectId.pipe(
        switchMap(objectId => {
          if (!objectId) {
            return of([undefined, undefined]);
          }

          const object = $stateService.get(this.vine).resolve(objectId);
          return combineLatest([
            object.$('icons'),
            object.$('lines'),
          ]);
        }),
        withLatestFrom(
            canvasConfigService.iconConfig$,
            canvasConfigService.lineConfig$,
        ),
        switchMap(([[icons, lines], iconConfigs, lineConfigs]) => {
          const renderIconEls = $pipe(
              icons ?? [],
              $map(icon => this.renderIcon(icon, iconConfigs)),
              $filterNonNull(),
              $asArray(),
          );

          const renderLineEls = $pipe(
              lines ?? [],
              $map(line => this.renderLine(line, lineConfigs)),
              $filterNonNull(),
              $asArray(),
          );

          const nodeObsList = [...renderIconEls, ...renderLineEls];

          if (nodeObsList.length <= 0) {
            return of([]);
          }

          return combineLatest(
              nodeObsList.map(node$ => node$.pipe(map(node => renderNode({node, id: {}})))),
          );
        }),
    );
  }

  private renderIcon(
      icon: CanvasIcon,
      iconConfigs: ReadonlyMap<string, IconConfig>,
  ): Observable<Node>|null {
    const config = iconConfigs.get(icon.configName);
    if (!config) {
      return null;
    }

    return $svgService.get(this.vine).getSvg(config.svgName).pipe(
        switchMap(svgContent => {
          if (!svgContent) {
            return of(
                this.context.shadowRoot.ownerDocument.createComment(`unknown SVG: ${config.svgName}`),
            );
          }

          return renderSvg({
            type: 'template',
            content: svgContent,
            x: `${icon.x}`,
            y: `${icon.y}`,
            width: `${icon.width}`,
            height: `${icon.height}`,
          });
        }),
    );
  }

  private renderLine(
      line: CanvasLine,
      lineConfigs: ReadonlyMap<string, LineConfig>,
  ): Observable<Node>|null {
    const config = lineConfigs.get(line.configName);
    if (!config) {
      return null;
    }
    return renderSvg({
      type: 'line',
      document: this.context.shadowRoot.ownerDocument,
      x1: `${line.fromX}`,
      x2: `${line.toX}`,
      y1: `${line.fromY}`,
      y2: `${line.toY}`,
      stroke: config.color,
      strokeDasharray: config.dashArray,
      strokeDashoffset: config.dashOffset,
      strokeLinecap: config.linecap,
      strokeWidth: config.width,
    });
  }
}
