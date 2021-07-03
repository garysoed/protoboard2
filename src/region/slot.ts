import {cache} from 'gs-tools/export/data';
import {Modifier} from 'gs-tools/export/state';
import {stateIdParser, _p} from 'mask';
import {$div, attributeIn, element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ActionSpec} from '../action/action-spec';
import {dropAction, dropActionConfigSpecs} from '../action/drop-action';
import {compileConfig} from '../action/util/compile-config';
import {BaseComponent} from '../core/base-component';
import {IsContainer} from '../payload/is-container';
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

export type SlotSpec = IsContainer;

export function slotSpec(input: Partial<SlotSpec>, x: Modifier): SlotSpec {
  return {
    contentsId: input.contentsId ?? x.add([]),
  };
}

@_p.customElement({
  ...$slot,
  template,
})
export class Slot extends BaseComponent<SlotSpec, typeof $> {
  constructor(context: PersonaContext) {
    super(context, $, $.host._.objectId);
  }

  @cache()
  protected get actions(): readonly ActionSpec[] {
    return [
      this.createActionSpec(dropAction, compileConfig($.host._.dropAction, this.context), 'Drop'),
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
