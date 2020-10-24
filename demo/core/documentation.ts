import { cache } from 'gs-tools/export/data';
import { switchMapNonNull } from 'gs-tools/export/rxjs';
import { assertUnreachable } from 'gs-tools/export/typescript';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, NodeWithId, PersonaContext, renderCustomElement, single } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $d1Demo, D1Demo } from '../piece/d1';
import { $d2Demo, D2Demo } from '../piece/d2';
import { $d6Demo, D6Demo } from '../piece/d6';
import { $deckDemo, DeckDemo } from '../region/deck';

import template from './documentation.html';
import { $instruction, Instruction } from './instruction';
import { $locationService, Views } from './location-service';


const $documentation = {
  tag: 'pbd-documentation',
  api: {},
};

const $ = {
  root: element('root', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  ...$documentation,
  dependencies: [
    D1Demo,
    D2Demo,
    D6Demo,
    DeckDemo,
    Instruction,
  ],
  template,
})
export class Documentation extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.render($.root._.content, this.content$);
  }

  @cache()
  private get content$(): Observable<NodeWithId<Node>|null> {
    return $locationService.get(this.vine)
        .pipe(
            switchMap(service => service.getLocation()),
            map(location => {
              switch (location.type) {
                case Views.D1:
                  return $d1Demo;
                case Views.D2:
                  return $d2Demo;
                case Views.D6:
                  return $d6Demo;
                case Views.DECK:
                  return $deckDemo;
                case Views.INSTRUCTION:
                  return $instruction;
                default:
                  assertUnreachable(location.type);
              }
            }),
            switchMapNonNull(spec => renderCustomElement(spec, {}, {}, this.context)),
        );
  }
}
