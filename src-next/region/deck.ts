import {cache} from 'gs-tools/export/data';
import {instanceofType, undefinedType} from 'gs-types';
import {Context, DIV, icall, query, itarget, ivalue, ocase, registerCustomElement} from 'persona';
import {Observable, OperatorFunction, pipe} from 'rxjs';
import {map} from 'rxjs/operators';

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
    // shuffleAction: shuffleActionConfigSpecs({}),
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