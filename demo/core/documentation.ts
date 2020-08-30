import { cache } from 'gs-tools/export/data';
import { switchMapNonNull } from 'gs-tools/export/rxjs';
import { assertUnreachable } from 'gs-tools/export/typescript';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext, renderCustomElement, single } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $d1Demo, D1Demo } from '../piece/d1';
import { $d2Demo, D2Demo } from '../piece/d2';

import template from './documentation.html';
import { $instruction, Instruction } from './instruction';
import { $locationService, Views } from './location-service';
// import { Deck } from '../zone/deck';


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
    // Deck,
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
  private get content$(): Observable<Node|null> {
    return $locationService.get(this.vine)
        .pipe(
            switchMap(service => service.getLocation()),
            map(location => {
              switch (location.type) {
                case Views.D1:
                  return $d1Demo;
                case Views.D2:
                  return $d2Demo;
                // case Views.DECK:
                //   return 'pbd-deck';
                // case Views.GRID_LAYOUT:
                //   return 'pbd-grid-layout';
                case Views.INSTRUCTION:
                  return $instruction;
                default:
                  assertUnreachable(location.type);
              }
            }),
            switchMapNonNull(spec => renderCustomElement(spec, {}, this.context)),
        );
  }
}
