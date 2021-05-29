import {$stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, _p} from 'mask';
import {element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {$slot, Slot, slotSpec, SlotSpec} from '../../export';
import {DocumentationTemplate} from '../template/documentation-template';

import template from './slot.html';


export const $slotDemo = {
  tag: 'pbd-slot',
  api: {},
};

type State = SlotSpec;

const $state = source<StateId<State>>(
    'state',
    vine => $stateService.get(vine).modify(x => x.add(slotSpec({}, x))),
);

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
      this.renderers.slot.objectId(of($state.get(this.context.vine))),
    ];
  }
}