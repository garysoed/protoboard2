import {cache} from 'gs-tools/export/data';
import {Modifier, StateId} from 'gs-tools/export/state';
import {stateIdParser, _p} from 'mask';
import {$div, attributeIn, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {dropAction, dropActionConfigSpecs} from '../action/drop-action';
import {compileConfig} from '../action/util/compile-config';
import {BaseComponent} from '../core/base-component';
import {ContentSpec, IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

import template from './slot.html';


export const $slot = {
  tag: 'pb-slot',
  api: {
    objectId: attributeIn('object-id', stateIdParser<SlotSpec>()),
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
  readonly $contentSpecs?: StateId<ReadonlyArray<ContentSpec<'indexed'>>>,
}

export function slotSpec(input: Input, x: Modifier): SlotSpec {
  return {
    containerType: 'indexed',
    $contentSpecs: input.$contentSpecs ?? x.add([]),
  };
}

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotSpec, typeof $> {
  constructor(context: PersonaContext) {
    super(
        context,
        $,
    );
  }

  @cache()
  protected get actions(): ReadonlyArray<ActionSpec<SlotSpec, TriggerConfig>> {
    return [
      dropAction(compileConfig($.host._.dropAction, this.context), this.context),
    ];
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
