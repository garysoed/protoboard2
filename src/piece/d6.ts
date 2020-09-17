import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { api, attributeOut, element, host, PersonaContext, stringParser, style } from 'persona';

import { FlipAction } from '../action/flip-action';
import { IsMultifaced } from '../action/payload/is-multifaced';
import { IsRotatable } from '../action/payload/is-rotatable';
import { RollAction } from '../action/roll-action';
import { RotateAction } from '../action/rotate-action';
import { TurnAction } from '../action/turn-action';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { renderMultifaced } from '../render/render-multifaced';
import { renderRotatable } from '../render/render-rotatable';

import template from './d6.html';


/**
 * The D6's API.
 *
 * @thModule piece
 */
export const $d6 = {
  api: {...$baseComponent.api},
  tag: 'pb-d6',
};

export const $ = {
  host: host({
    ...api($d6.api),
    styleTransform: style('transform'),
  }),
  face: element('face', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
};

export interface D6Payload extends IsMultifaced, IsRotatable {

}

/**
 * Represents an object with six faces.
 *
 * @remarks
 * D6 supports {@link PickAction}, {@link RotateAction}., {@link FlipAction}, {@link RollAction},
 * and {@link TurnAction}.
 *
 * @thSlot - Face to display for the object.
 * @thWebComponent
 * @thModule piece
 */
@_p.customElement({
  ...$d6,
  template,
})
export class D6 extends BaseComponent<D6Payload> {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D6Payload, any>>([
          [
            TriggerSpec.R,
            context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          ],
          [TriggerSpec.F, context => new FlipAction(context, {count: 6})],
          [TriggerSpec.T, context => new TurnAction(context, {count: 6})],
          [TriggerSpec.L, context => new RollAction(context, {count: 6})],
        ]),
        context,
        $.host,
    );
    this.addSetup(renderMultifaced(this.objectPayload$, $.face._.name, context));
    this.addSetup(renderRotatable(this.objectPayload$, $.host._.styleTransform, context));
  }
}
