import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Type} from 'gs-types';
import {Context, DIV, icall, itarget, ivalue, ocase, query, registerCustomElement} from 'persona';
import {BehaviorSubject, concat, EMPTY, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {shuffleAction} from '../action/shuffle-action';
import {$activeState} from '../core/active-spec';
import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {ComponentId} from '../id/component-id';
import {RegionState, REGION_STATE_TYPE} from '../types/region-state';
import {TriggerSpec, TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import template from './deck.html';


export interface DeckState extends RegionState { }

export const DECK_STATE_TYPE: Type<DeckState> = REGION_STATE_TYPE;

export function deckState(id: ComponentId<unknown>, input: Partial<DeckState> = {}): DeckState {
  return {
    id,
    contentIds: new BehaviorSubject<ReadonlyArray<ComponentId<unknown>>>([]),
    ...input,
  };
}

const $deck = {
  host: {
    ...create$baseRegion<DeckState>(DECK_STATE_TYPE).host,
    dropAll: icall('dropAll', []),
    dropAllConfig: ivalue('dropAllConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.D, shift: true}),
    pickAll: icall('pickAll', []),
    pickAllConfig: ivalue('pickAllConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.CLICK, shift: true}),
    shuffle: icall('shuffle', []),
    shuffleConfig: ivalue('shuffleConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.S}),
  },
  shadow: {
    root: query('#root', DIV, {
      content: ocase<ComponentId<unknown>|null>('#content'),
      target: itarget(),
    }),
  },
};

class Deck extends BaseRegion<DeckState> {
  constructor(private readonly $: Context<typeof $deck>) {
    super($, 'Deck');
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    const activeContents$ = $activeState.get(this.$.vine).contentIds;
    const contents$ = this.state.$('contentIds');
    return [
      ...super.runs,
      this.installAction<TriggerSpec, unknown>(
          () => pipe(
              withLatestFrom(activeContents$, contents$),
              switchMap(([payload, activeContents, contents]) => {
                return concat(
                    of([]).pipe(forwardTo(activeContents$), switchMap(() => EMPTY)),
                    of([...contents, ...activeContents]).pipe(contents$.set(), switchMap(() => EMPTY)),
                    of(payload),
                );
              }),
          ),
          'Drop all',
          this.target$,
          this.$.host.dropAllConfig,
          this.$.host.dropAll,
      ),
      this.installAction<TriggerSpec, unknown>(
          () => pipe(
              withLatestFrom(activeContents$, contents$),
              switchMap(([payload, activeContents, contents]) => {
                return concat(
                    of([...activeContents, ...[...contents].reverse()]).pipe(
                        forwardTo(activeContents$),
                        switchMap(() => EMPTY),
                    ),
                    of([]).pipe(contents$.set(), switchMap(() => EMPTY)),
                    of(payload),
                );
              }),
          ),
          'Pick all',
          this.target$,
          this.$.host.pickAllConfig,
          this.$.host.pickAll,
      ),
      this.installAction(
          shuffleAction,
          'Shuffle',
          this.target$,
          this.$.host.shuffleConfig,
          this.$.host.shuffle,
      ),
    ];
  }

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<ReadonlyArray<ComponentId<unknown>>, unknown> {
    return pipe(
        map(specs => specs[specs.length - 1] ?? null),
        this.$.shadow.root.content(map(id => id === null ? null : renderContentFn(id))),
    );
  }

  @cache()
  get target$(): Observable<HTMLElement> {
    return this.$.shadow.root.target;
  }
}


export const DECK = registerCustomElement({
  ctrl: Deck,
  spec: $deck,
  tag: 'pb-deck',
  template,
});