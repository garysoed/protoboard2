import { InstanceofType } from '@gs-types';
import { _p, _v, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, single, SingleRenderSpec } from '@persona';
import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { $ as playAreaService$ } from './play-area-service';
import template from './play-area.html';
import { PlayDefault } from './play-default';

const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
};

@_p.customElement({
  dependencies: [
    PlayDefault,
  ],
  tag: 'pbd-play-area',
  template,
})
export class PlayArea extends ThemedCustomElementCtrl {
  private readonly playAreaService$ = playAreaService$.asSubject();

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.root._.content).withVine(_v.stream(this.renderContent, this)),
    ];
  }

  private renderContent(): Observable<SingleRenderSpec> {
    return this.playAreaService$.pipe(
        switchMap(service => service.getTag()),
        map(tag => {
          if (tag) {
            return {tag};
          }

          return {
            tag: 'pbd-play-default',
          };
        }),
    );
  }
}

