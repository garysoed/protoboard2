import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {instanceofType} from 'gs-types';
import {_p} from 'mask';
import {element, host, multi, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {Logger} from 'santa';

import {DropAction} from '../action/drop-action';
import {ShuffleAction} from '../action/shuffle-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {ContentSpec} from '../payload/is-container';
import {renderContents} from '../render/render-contents';
import {containerSpec, ContainerSpec} from '../types/container-spec';

import template from './deck.html';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('pb.Deck');


export const $deck = {
  tag: 'pb-deck',
  api: {...$baseComponent.api},
};

export const $ = {
  host: host($deck.api),
  root: element('root', instanceofType(HTMLDivElement), {
    contents: multi('#contents'),
  }),
};

export type DeckSpec<P> = ContainerSpec<P, 'indexed'>;

interface Input<P> {
  readonly type: string;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<'indexed'>>>;
  readonly payload: P;
}

export function deckSpec<P>(input: Input<P>): DeckSpec<P> {
  return containerSpec({
    ...input,
    containerType: 'indexed',
  });
}

@_p.customElement({
  ...$deck,
  template,
})
export class Deck extends BaseComponent<DeckSpec<unknown>, typeof $> {
  constructor(context: PersonaContext) {
    super(
        [
          {trigger: TriggerType.D, provider: context => new DropAction(() => 0, context, {})},
          {trigger: TriggerType.S, provider: context => new ShuffleAction(context)},
        ],
        context,
        $,
    );
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.contents(
          this.objectId$.pipe(
              switchMap(objectId => renderContents(objectId, this.context)),
          ),
      ),
    ];
  }
}
