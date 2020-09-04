import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, host, multi, PersonaContext } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PickAction } from '../../export';
import { DropAction } from '../action/drop-action';
import { DroppablePayload } from '../action/payload/droppable-payload';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { renderContents } from '../render/render-contents';

import template from './slot.html';


export const $slot = {
  tag: 'pb-slot',
  api: {
    ...$baseComponent.api,
  },
};

export const $ = {
  host: host($slot.api),
  root: element('root', instanceofType(HTMLDivElement), {
    content: multi('#content'),
  }),
};

// tslint:disable-next-line: no-empty-interface
export interface SlotPayload extends DroppablePayload { }

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotPayload> {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<SlotPayload, any>>([
          [TriggerSpec.CLICK, context => new PickAction(context)],
          [TriggerSpec.D, context => new DropAction(context, {location: 0})],
        ]),
        context,
        $.host,
    );

    this.render($.root._.content, this.contents$);
  }

  @cache()
  private get contents$(): Observable<readonly Node[]> {
    return this.state$.pipe(switchMap(state => renderContents(state, this.context)));
  }
}
