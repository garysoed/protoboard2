import { Vine } from '@grapevine';
import { InstanceofType } from '@gs-types';
import { _p, _v, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, single, SingleRenderSpec } from '@persona';
import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { $locationService } from '../location-service';

import template from './doc.html';
import { Instruction } from './instruction';
import { Piece } from './piece';

const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  dependencies: [
    Instruction,
    Piece,
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
                case 'INSTRUCTION':
                  return {tag: 'pbd-instruction'};
                case 'PIECE':
                  return {tag: 'pbd-piece'};
                default:
                  return null;
              }
            }),
        );
  }
}
