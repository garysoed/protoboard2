import {cache} from 'gs-tools/export/data';
import {combineLatestObject} from 'gs-tools/export/rxjs';
import {registerSvg, stateIdParser, _p} from 'mask';
import {attributeIn, enumParser, host, integerParser, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionSpec, TriggerConfig} from '../../src/action/action-spec';
import {drawIconAction} from '../../src/action/draw-icon-action';
import {$baseComponent, BaseComponent} from '../../src/core/base-component';
import {TriggerSpec, TriggerType} from '../../src/core/trigger-spec';
import {$canvasConfigService} from '../../src/face/canvas-config-service';
import {CanvasEntry} from '../../src/face/canvas-entry';
import canvasCircle from '../asset/canvas_circle.svg';
import canvasSquare from '../asset/canvas_square.svg';
import canvasTriangle from '../asset/canvas_triangle.svg';

import template from './canvas-node.html';


enum IconType {
  CIRCLE = 'canvas_circle',
  SQUARE = 'canvas_square',
  TRIANGLE = 'canvas_triangle',
}

export const $canvasNode = {
  tag: 'pbd-canvas-node',
  api: {
    objectId: attributeIn('object-id', stateIdParser<CanvasEntry>()),
    iconType: attributeIn('icon-type', enumParser<IconType>(IconType)),
    x: attributeIn('x', integerParser(), 0),
    y: attributeIn('y', integerParser(), 0),
  },
};

interface State {}

const $ = {
  host: host({
    ...$baseComponent.api,
    ...$canvasNode.api,
  }),
};


@_p.customElement({
  ...$canvasNode,
  configure: vine => {
    registerSvg(vine, IconType.CIRCLE, {type: 'embed', content: canvasCircle});
    registerSvg(vine, IconType.SQUARE, {type: 'embed', content: canvasSquare});
    registerSvg(vine, IconType.TRIANGLE, {type: 'embed', content: canvasTriangle});

    const canvasConfigService = $canvasConfigService.get(vine);
    // Icon configs
    canvasConfigService.addConfig(
        IconType.CIRCLE,
        {
          type: 'icon',
          svgName: IconType.CIRCLE,
          height: 30,
          width: 30,
        },
    );
    canvasConfigService.addConfig(
        IconType.SQUARE,
        {
          type: 'icon',
          svgName: IconType.SQUARE,
          height: 30,
          width: 30,
        },
    );
    canvasConfigService.addConfig(
        IconType.TRIANGLE,
        {
          type: 'icon',
          svgName: IconType.TRIANGLE,
          height: 30,
          width: 30,
        },
    );
  },
  template,
})
export class CanvasNode extends BaseComponent<State, typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get actions(): ReadonlyArray<ActionSpec<TriggerConfig>> {
    return [
      drawIconAction(
          combineLatestObject({
            configName: this.iconConfigName$,
            x: this.x$,
            y: this.y$,
            trigger: this.iconTrigger$,
          }),
          'Draw icon',
      ),
    ];
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }

  @cache()
  private get iconConfigName$(): Observable<string> {
    return this.inputs.host.iconType.pipe(map(iconType => iconType ?? ''));
  }

  @cache()
  private get iconTrigger$(): Observable<TriggerSpec|null> {
    return this.inputs.host.iconType.pipe(
        map(iconType => iconType ? {type: TriggerType.Q} : null),
    );
  }

  @cache()
  private get x$(): Observable<number> {
    return this.inputs.host.x;
  }

  @cache()
  private get y$(): Observable<number> {
    return this.inputs.host.y;
  }
}

