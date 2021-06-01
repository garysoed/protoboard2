import {renderSvg} from 'almagest';
import {$stateService} from 'grapevine';
import {$asArray, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {$svgService, BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {$svg, attributeIn, element, host, multi, PersonaContext, renderNode, RenderSpec} from 'persona';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {IconConfig, LineConfig} from './canvas-config';
import {$canvasConfigService} from './canvas-config-service';
import {CanvasIcon, CanvasLine} from './canvas-entry';
import template from './canvas.html';


export interface CanvasEntry {
  readonly icons: StateId<readonly CanvasIcon[]>;
  readonly lines: StateId<readonly CanvasLine[]>;
}

export const $canvas = {
  tag: 'pb-canvas',
  api: {
    objectId: attributeIn('object-id', stateIdParser<CanvasEntry>()),
  },
};

export const $ = {
  host: host($canvas.api),
  root: element('root', $svg, {
    content: multi('#content'),
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
      this.renderers.root.content(this.content$),
    ];
  }

  @cache()
  private get content$(): Observable<readonly RenderSpec[]> {
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
          const renderIconSpecs = $pipe(
              icons ?? [],
              $map(icon => this.renderIcon(icon, iconConfigs)),
              $filterNonNull(),
              $asArray(),
          );

          const renderLineSpecs = $pipe(
              lines ?? [],
              $map(line => this.renderLine(line, lineConfigs)),
              $filterNonNull(),
              $asArray(),
          );

          const renderSpecs = [...renderIconSpecs, ...renderLineSpecs];

          if (renderSpecs.length <= 0) {
            return of([]);
          }

          return combineLatest(renderSpecs);
        }),
    );
  }

  private renderIcon(
      icon: CanvasIcon,
      iconConfigs: ReadonlyMap<string, IconConfig>,
  ): Observable<RenderSpec>|null {
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
            width: `${config.width}`,
            height: `${config.height}`,
          });
        }),
        map(svgEl => renderNode({node: svgEl, id: {}})),
    );
  }

  private renderLine(
      line: CanvasLine,
      lineConfigs: ReadonlyMap<string, LineConfig>,
  ): Observable<RenderSpec>|null {
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
    })
        .pipe(
            map(svgEl => renderNode({node: svgEl, id: {}})),
        );
  }
}
