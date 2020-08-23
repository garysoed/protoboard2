import { mapNonNull } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext, SimpleElementRenderSpec, single } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { D1 } from '../component/d1';
import { D2 } from '../component/d2';
import { FreeLayout } from '../layout/free-layout';
import { GridLayout } from '../layout/grid-layout';
import { $locationService, Views } from '../location-service';
import { Deck } from '../zone/deck';
import { Slot } from '../zone/slot';

import template from './doc.html';
import { Instruction } from './instruction';


const $ = {
  root: element('root', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  dependencies: [
    D1,
    D2,
    Deck,
    FreeLayout,
    GridLayout,
    Instruction,
    Slot,
  ],
  tag: 'pbd-doc',
  template,
  api: {},
})
export class Doc extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.render($.root._.content, this.renderContent());
  }

  private renderContent(): Observable<SimpleElementRenderSpec|null> {
    return $locationService.get(this.vine)
        .pipe(
            switchMap(service => service.getLocation()),
            map(location => {
              switch (location.type) {
                case Views.D1:
                  return 'pbd-d1';
                case Views.D2:
                  return 'pbd-d2';
                case Views.DECK:
                  return 'pbd-deck';
                case Views.FREE_LAYOUT:
                  return 'pbd-free-layout';
                case Views.GRID_LAYOUT:
                  return 'pbd-grid-layout';
                case Views.INSTRUCTION:
                  return 'pbd-instruction';
                case Views.SLOT:
                  return 'pbd-slot';
                default:
                  return null;
              }
            }),
            mapNonNull(tag => new SimpleElementRenderSpec(tag)),
        );
  }
}
