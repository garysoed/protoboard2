import {renderSvg} from 'almagest';
import {$stateService} from 'grapevine';
import {$asArray, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {$svg, attributeIn, element, host, multi, PersonaContext, renderNode, RenderSpec} from 'persona';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {$canvasConfigService} from './canvas-config-service';
import {CanvasLine} from './canvas-entry';
import template from './canvas.html';


export interface CanvasEntry {
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
    return this.inputs.host.objectId.pipe(
        switchMap(objectId => {
          if (!objectId) {
            return of(undefined);
          }

          return $stateService.get(this.vine).resolve(objectId).$('lines');
        }),
        withLatestFrom($canvasConfigService.get(this.vine).lineConfig$),
        switchMap(([lines, lineConfigs]) => {
          const renderSpecs = $pipe(
              lines ?? [],
              $map(line => {
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
              }),
              $filterNonNull(),
              $asArray(),
          );

          if (renderSpecs.length <= 0) {
            return of([]);
          }

          return combineLatest(renderSpecs);
        }),
    );
  }
}
