import { Vine } from 'grapevine';
import { mapNonNull } from 'gs-tools/export/rxjs';
import { InstanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, SimpleElementRenderSpec, single } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { D1 } from '../component/d1';
import { D2 } from '../component/d2';
import { FreeLayout } from '../layout/free-layout';
import { GridLayout } from '../layout/grid-layout';
import { $locationService, Views } from '../location-service';
import { Slot } from '../zone/slot';

import template from './doc.html';
import { Instruction } from './instruction';


const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  dependencies: [
    D1,
    D2,
    FreeLayout,
    GridLayout,
    Instruction,
    Slot,
  ],
  tag: 'pbd-doc',
  template,
})
export class Doc extends ThemedCustomElementCtrl {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.render($.root._.content).withFunction(this.renderContent);
  }

  private renderContent(vine: Vine): Observable<SimpleElementRenderSpec|null> {
    return $locationService.get(vine)
        .pipe(
            switchMap(service => service.getLocation()),
            map(location => {
              switch (location.type) {
                case Views.D1:
                  return 'pbd-d1';
                case Views.D2:
                  return 'pbd-d2';
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
