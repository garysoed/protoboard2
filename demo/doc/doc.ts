import { Vine } from 'grapevine';
import { mapNonNull } from 'gs-tools/export/rxjs';
import { InstanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, SimpleElementRenderSpec, single } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $locationService } from '../location-service';

import { D1 } from './d1';
import template from './doc.html';
import { Instruction } from './instruction';


const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  dependencies: [
    Instruction,
    D1,
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
                case 'FREE_LAYOUT':
                  return 'pbd-free-layout';
                case 'GRID_LAYOUT':
                  return 'pbd-grid-layout';
                case 'INSTRUCTION':
                  return 'pbd-instruction';
                case 'D1':
                  return 'pbd-d1';
                default:
                  return null;
              }
            }),
            mapNonNull(tag => new SimpleElementRenderSpec(tag)),
        );
  }
}
