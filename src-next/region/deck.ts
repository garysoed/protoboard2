import {cache} from 'gs-tools/export/data';
import {undefinedType} from 'gs-types';
import {Context, DIV, icall, id, itarget, ivalue, osingle, registerCustomElement, RenderSpec} from 'persona';
import {Observable, OperatorFunction, pipe} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseRegion, create$baseRegion} from '../core/base-region';
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
    // shuffleAction: shuffleActionConfigSpecs({}),
  },
  shadow: {
    root: id('root', DIV, {
      content: osingle('#content'),
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
    return [
      ...super.runs,
      // this.installAction(
      //     dropAction,
      //     'Drop all',
      //     this.target$,
      //     this.$.host.dropAllConfig,
      //     this.$.host.dropAll,
      // ),
      // this.installAction(
      //     pickAction,
      //     'Pick all',
      //     this.target$,
      //     this.$.host.pickAllConfig,
      //     this.$.host.pickAll,
      // ),
      // this.createActionSpec(shuffleAction, compileConfig($.host._.shuffleAction, this.context), 'Shuffle'),
    ];
  }

  renderContents(): OperatorFunction<readonly RenderSpec[], unknown> {
    return pipe(
        map(specs => specs[specs.length - 1] ?? null),
        this.$.shadow.root.content(),
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