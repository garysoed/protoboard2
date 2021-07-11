import {immutablePathSource, rootStateIdSource} from 'grapevine';
import {BaseThemedCtrl, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$slot, Slot, slotSpec, SlotSpec} from '../../src/region/slot';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './slot.html';


export const $slotDemo = {
  tag: 'pbd-slot',
  api: {},
};

type State = SlotSpec;

const $state = rootStateIdSource<State>(() => slotSpec({}));
const $statePath = immutablePathSource($state);

const $ = {
  slot: element('slot', $slot, {}),
};


@_p.customElement({
  ...$slotDemo,
  template,
  dependencies: [
    DocumentationTemplate,
    Slot,
  ],
})
export class SlotDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.slot.objectPath(of($statePath.get(this.context.vine))),
    ];
  }
}