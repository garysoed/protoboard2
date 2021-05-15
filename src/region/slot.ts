import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$div, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {DropAction} from '../action/drop-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {ContentSpec} from '../payload/is-container';
import {renderContents} from '../render/render-contents';
import {containerSpec, ContainerSpec} from '../types/container-spec';

import template from './slot.html';


export const $slot = {
  tag: 'pb-slot',
  api: {
    ...$baseComponent.api,
  },
};

export const $ = {
  host: host({
    ...$slot.api,
  }),
  root: element('root', $div, {
    content: multi('#content'),
  }),
};

export type SlotSpec<P> = ContainerSpec<P, 'indexed'>;

interface Input<P> {
  readonly type: string;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<'indexed'>>>,
  readonly payload: P;
}

export function slotSpec<P>(input: Input<P>): SlotSpec<P> {
  return containerSpec({
    ...input,
    containerType: 'indexed',
  });
}

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotSpec<unknown>, typeof $> {
  constructor(context: PersonaContext) {
    super(
        [
          {trigger: TriggerType.D, provider: context => new DropAction(() => 0, context, {})},
        ],
        context,
        $,
    );
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.content(
          this.objectId$.pipe(
              switchMap(objectId => renderContents(objectId, this.vine)),
          )),
    ];
  }
}
