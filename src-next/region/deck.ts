import {cache} from 'gs-tools/export/data';
import {instanceofType, undefinedType} from 'gs-types';
import {Context, DIV, icall, itarget, ivalue, ocase, query, registerCustomElement} from 'persona';
import {concat, Observable, of, OperatorFunction, pipe, EMPTY} from 'rxjs';
import {map, switchMap, withLatestFrom, switchMapTo} from 'rxjs/operators';

import {shuffleAction} from '../action/shuffle-action';
import {$activeState} from '../core/active-spec';
import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {RegionState} from '../types/region-state';
import {TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import template from './deck.html';


export interface DeckState extends RegionState { }


const $deck = {
  host: {
    ...create$baseRegion<DeckState>().host,
    dropAll: icall('dropAll', undefinedType),
    dropAllConfig: ivalue('dropAllConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.D, shift: true}),
    pickAll: icall('pickAll', undefinedType),
    pickAllConfig: ivalue('pickAllConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.CLICK, shift: true}),
    shuffle: icall('shuffle', undefinedType),
    shuffleConfig: ivalue('shuffleConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.S}),
  },
  shadow: {
    root: query('#root', DIV, {
      content: ocase('#content', instanceofType(Object)),
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
    const activeContents$ = $activeState.get(this.$.vine).$('contentIds');
    const contents$ = this.state.$('contentIds');
    return [
      ...super.runs,
      this.installAction(
          () => pipe(
              withLatestFrom(activeContents$, contents$),
              switchMap(([payload, activeContents, contents]) => {
                return concat(
                    of([]).pipe(activeContents$.set(), switchMapTo(EMPTY)),
                    of([...contents, ...activeContents]).pipe(contents$.set(), switchMapTo(EMPTY)),
                    of(payload),
                );
              }),
          ),
          'Drop all',
          this.target$,
          this.$.host.dropAllConfig,
          this.$.host.dropAll,
      ),
      this.installAction(
          () => pipe(
              withLatestFrom(activeContents$, contents$),
              switchMap(([payload, activeContents, contents]) => {
                return concat(
                    of([...activeContents, ...[...contents].reverse()]).pipe(activeContents$.set(), switchMapTo(EMPTY)),
                    of([]).pipe(contents$.set(), switchMapTo(EMPTY)),
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

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<ReadonlyArray<{}>, unknown> {
    return pipe(
        map(specs => specs[specs.length - 1] ?? null),
        this.$.shadow.root.content((id: {}) => renderContentFn(id)),
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