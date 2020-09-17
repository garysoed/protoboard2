import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { $stateService, _p } from 'mask';
import { api, attributeOut, element, host, PersonaContext, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { FlipAction } from '../action/flip-action';
import { IsMultifaced } from '../action/payload/is-multifaced';
import { IsRotatable } from '../action/payload/is-rotatable';
import { RollAction } from '../action/roll-action';
import { RotateAction } from '../action/rotate-action';
import { TurnAction } from '../action/turn-action';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d2.html';


/**
 * The D2's API.
 *
 * @thModule piece
 */
export const $d2 = {
  api: {...$baseComponent.api},
  tag: 'pb-d2',
};

export const $ = {
  host: host(api($d2.api)),
  face: element('face', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
};

export interface D2Payload extends IsMultifaced, IsRotatable {

}

/**
 * Represents an object with two faces.
 *
 * @remarks
 * D2 supports {@link PickAction}, {@link RotateAction}., {@link FlipAction}, {@link RollAction},
 * and {@link TurnAction}.
 *
 * @thSlot - Face to display for the object.
 * @thWebComponent
 * @thModule piece
 */
@_p.customElement({
  ...$d2,
  template,
})
export class D2 extends BaseComponent<D2Payload> {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D2Payload, any>>([
          [
            TriggerSpec.R,
            context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          ],
          [TriggerSpec.F, context => new FlipAction(context, {count: 2})],
          [TriggerSpec.T, context => new TurnAction(context, {count: 2})],
          [TriggerSpec.L, context => new RollAction(context, {count: 2})],
        ]),
        context,
        $.host,
    );
    this.render($.face._.name, this.faceName$);
  }

  @cache()
  private get faceName$(): Observable<string> {
    return combineLatest([this.objectSpec$, $stateService.get(this.vine)]).pipe(
        switchMap(([spec, stateService]) => {
          if (!spec) {
            return observableOf(null);
          }

          return stateService.get(spec.payload.$faceIndex);
        }),
        map(faceIndex => `face-${faceIndex ?? 0}`),
    );
  }
}
