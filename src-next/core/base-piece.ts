import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {ImmutableResolver} from 'gs-tools/export/state';
import {intersectType, undefinedType} from 'gs-types';
import {Context, iattr, icall, ivalue} from 'persona';
import {IAttr, ICall, IValue} from 'persona/export/internal';
import {Observable, OperatorFunction} from 'rxjs';

import {pickAction} from '../action/pick-action';
import {DEFAULT_ROTATE_CONFIG, rotateAction, RotateConfig, ROTATE_CONFIG_TYPE} from '../action/rotate-action';
import {BaseComponent, BaseComponentSpecType, create$baseComponent} from '../core/base-component';
import {renderRotatable} from '../render/render-rotatable';
import {PieceState} from '../types/piece-state';
import {TriggerSpec, TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';


interface BasePieceSpecType<S extends PieceState> extends BaseComponentSpecType<S> {
  host: {
    readonly height: IAttr,
    readonly width: IAttr,
    readonly pick: ICall<undefined, 'pick'>;
    readonly pickConfig: IValue<TriggerSpec, 'pickConfig'>;
    readonly rotate: ICall<undefined, 'rotate'>;
    readonly rotateConfig: IValue<RotateConfig&TriggerSpec, 'rotateConfig'>;
  } & BaseComponentSpecType<S>['host'];
}

export function create$basePiece<S extends PieceState>(): BasePieceSpecType<S> {
  return {
    host: {
      ...create$baseComponent<S>().host,
      height: iattr('height'),
      width: iattr('width'),
      pick: icall('pick', undefinedType),
      pickConfig: ivalue('pickConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.CLICK, shift: false}),
      rotate: icall('rotate', undefinedType),
      rotateConfig: ivalue(
          'rotateConfig',
          intersectType([TRIGGER_SPEC_TYPE, ROTATE_CONFIG_TYPE]),
          {...DEFAULT_ROTATE_CONFIG, type: TriggerType.R},
      ),
    },
  };
}

export abstract class BasePiece<S extends PieceState> extends BaseComponent<S> {
  /**
   * @internal
   */
  constructor(
      private readonly $basePiece: Context<BasePieceSpecType<S>>,
      defaultComponentName: string,
  ) {
    super($basePiece, defaultComponentName);
  }

  abstract renderHeight(): OperatorFunction<string, unknown>;

  abstract renderRotationDeg(): OperatorFunction<string, unknown>;

  abstract renderWidth(): OperatorFunction<string, unknown>;

  protected abstract get target$(): Observable<HTMLElement>;

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.$basePiece.host.height.pipe(mapNullableTo(''), this.renderHeight()),
      this.$basePiece.host.width.pipe(mapNullableTo(''), this.renderWidth()),
      (this.state as ImmutableResolver<PieceState>).$('rotationDeg').pipe(
          renderRotatable(),
          this.renderRotationDeg(),
      ),
      this.installAction(
          pickAction,
          'Pick',
          this.target$,
          this.$basePiece.host.pickConfig,
          this.$basePiece.host.pick,
      ),
      this.installAction(
          rotateAction,
          'Rotate',
          this.target$,
          this.$basePiece.host.rotateConfig,
          this.$basePiece.host.rotate,
      ),
    ];
  }
}
