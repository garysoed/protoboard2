import { cache } from 'gs-tools/export/data';
import { switchMapNonNull } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext, renderCustomElement, single } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// import { D1 } from '../component/d1';
// import { D2 } from '../component/d2';
// import { FreeLayout } from '../layout/free-layout';
// import { GridLayout } from '../layout/grid-layout';
// import { $locationService, Views } from '../location-service';
// import { Deck } from '../zone/deck';
// import { Slot } from '../zone/slot';
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
    // D1,
    // D2,
    // Deck,
    // FreeLayout,
    // GridLayout,
    Instruction,
    // Slot,
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
                // case Views.D1:
                //   return 'pbd-d1';
                // case Views.D2:
                //   return 'pbd-d2';
                // case Views.DECK:
                //   return 'pbd-deck';
                // case Views.FREE_LAYOUT:
                //   return 'pbd-free-layout';
                // case Views.GRID_LAYOUT:
                //   return 'pbd-grid-layout';
                case Views.INSTRUCTION:
                  return $instruction;
                // case Views.SLOT:
                //   return 'pbd-slot';
                default:
                  return null;
              }
            }),
            switchMapNonNull(spec => renderCustomElement(spec, {}, this.context)),
        );
  }
}
