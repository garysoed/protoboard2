import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$div, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {dropAction, dropActionConfigSpecs} from '../action/drop-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {ContentSpec, IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

import template from './slot.html';


export const $slot = {
  tag: 'pb-slot',
  api: {
    ...$baseComponent.api,
    dropAction: dropActionConfigSpecs({}),
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

export type SlotSpec = IsContainer<'indexed'>;

interface Input {
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<'indexed'>>>,
}

export function slotSpec(input: Input): SlotSpec {
  return {...input, containerType: 'indexed'};
}

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotSpec, typeof $> {
  constructor(context: PersonaContext) {
    super(
        [
          dropAction($.host._.dropAction),
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
