import {cache} from 'gs-tools/export/data';
import {combineLatestObject} from 'gs-tools/export/rxjs';
import {registerSvg, stateIdParser, _p} from 'mask';
import {attributeIn, enumParser, host, integerParser, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionSpec} from '../../src/action/action-spec';
import {drawIconAction} from '../../src/action/draw-icon-action';
import {drawLineAction} from '../../src/action/draw-line-action';
import {BaseComponent} from '../../src/core/base-component';
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

enum LineType {
  CYAN = 'cyan_line',
  MAGENTA = 'magenta_line',
  YELLOW = 'yellow_line',
}

export const $canvasNode = {
  tag: 'pbd-canvas-node',
  api: {
    objectId: attributeIn('object-id', stateIdParser<CanvasEntry>()),
    iconType: attributeIn('icon-type', enumParser<IconType>(IconType)),
    x: attributeIn('x', integerParser(), 0),
    y: attributeIn('y', integerParser(), 0),
    width: attributeIn('x', integerParser(), 0),
    height: attributeIn('y', integerParser(), 0),
  },
};

type State = CanvasEntry;

const $ = {
  host: host({
    ...$canvasNode.api,
  }),
};

const WIDTH = 30;
const HEIGHT = 30;

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
        {type: 'icon', svgName: IconType.CIRCLE},
    );
    canvasConfigService.addConfig(
        IconType.SQUARE,
        {type: 'icon', svgName: IconType.SQUARE},
    );
    canvasConfigService.addConfig(
        IconType.TRIANGLE,
        {type: 'icon', svgName: IconType.TRIANGLE},
    );

    // Line configs
    canvasConfigService.addConfig(
        LineType.CYAN,
        {
          type: 'line',
          color: 'cyan',
          dashArray: ['5', '15'],
          dashOffset: '0',
          linecap: 'round',
          width: '5',
        },
    );
    canvasConfigService.addConfig(
        LineType.MAGENTA,
        {
          type: 'line',
          color: 'magenta',
          dashArray: ['5', '15'],
          dashOffset: '5',
          linecap: 'round',
          width: '5',
        },
    );
    canvasConfigService.addConfig(
        LineType.YELLOW,
        {
          type: 'line',
          color: 'yellow',
          dashArray: ['5', '15'],
          dashOffset: '10',
          linecap: 'round',
          width: '5',
        },
    );
  },
  template,
})
export class CanvasNode extends BaseComponent<State, typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get actions(): readonly ActionSpec[] {
    return [
      this.createActionSpec(
          drawIconAction,
          combineLatestObject({
            configName: this.iconConfigName$,
            x: this.x$,
            y: this.y$,
            width: of(WIDTH),
            height: of(HEIGHT),
            trigger: this.iconTrigger$,
          }),
          'Draw icon',
      ),
      this.createActionSpec(
          drawLineAction,
          combineLatestObject({
            configName: of(LineType.CYAN),
            x: this.lineX$,
            y: this.lineY$,
            trigger: of({type: TriggerType.A}),
          }),
          'Draw cyan line',
      ),
      this.createActionSpec(
          drawLineAction,
          combineLatestObject({
            configName: of(LineType.MAGENTA),
            x: this.lineX$,
            y: this.lineY$,
            trigger: of({type: TriggerType.S}),
          }),
          'Draw magenta line',
      ),
      this.createActionSpec(
          drawLineAction,
          combineLatestObject({
            configName: of(LineType.YELLOW),
            x: this.lineX$,
            y: this.lineY$,
            trigger: of({type: TriggerType.D}),
          }),
          'Draw yellow line',
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
  private get lineX$(): Observable<number> {
    return this.x$.pipe(map(x => x + WIDTH / 2));
  }

  @cache()
  private get lineY$(): Observable<number> {
    return this.y$.pipe(map(y => y + HEIGHT / 2));
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

