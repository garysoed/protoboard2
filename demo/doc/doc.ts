import { Vine } from '@grapevine';
import { InstanceofType } from '@gs-types';
import { _p, _v, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, single, SingleRenderSpec } from '@persona';
import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

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
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.root._.content).withVine(_v.stream(this.renderContent, this)),
    ];
  }

  private renderContent(vine: Vine): Observable<SingleRenderSpec|null> {
    return $locationService.get(vine)
        .pipe(
            switchMap(service => service.getLocation()),
            map(location => {
              switch (location.type) {
                case 'FREE_LAYOUT':
                  return {tag: 'pbd-free-layout'};
                case 'GRID_LAYOUT':
                  return {tag: 'pbd-grid-layout'};
                case 'INSTRUCTION':
                  return {tag: 'pbd-instruction'};
                case 'D1':
                  return {tag: 'pbd-d1'};
                default:
                  return null;
              }
            }),
        );
  }
}
