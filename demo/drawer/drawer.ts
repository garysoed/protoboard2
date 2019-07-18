import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { InstanceofType } from '@gs-types';
import { $svgConfig, _p, booleanParser, IconWithText, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { attributeIn, element, InitFn, onDom, repeated, RepeatedSpec } from '@persona';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';
import { $locationService } from '../location-service';

import template from './drawer.html';

export const $$ = {
  drawerExpanded: attributeIn('drawer-expanded', booleanParser(), false),
};


const $ = {
  components: element('components', InstanceofType(HTMLDivElement), {
    contents: repeated('#contents', 'mk-text-icon-button'),
  }),
  host: element($$),
  layouts: element('layouts', InstanceofType(HTMLDivElement), {
    contents: repeated('#contents', 'mk-text-icon-button'),
  }),
  root: element('root', InstanceofType(HTMLDivElement), {
    onClick: onDom('click'),
  }),
};

interface LinkConfig {
  label: string;
  path: string;
}

const COMPONENT_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Piece', path: 'PIECE'},
];

const LAYOUT_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Free', path: 'LAYOUT_FREE'},
];

@_p.customElement({
  configure: vine => {
    const icons = new Map([
      ['chevron_down', chevronDownSvg],
    ]);
    const svgConfigMap$ = $svgConfig.get(vine);
    for (const [key, content] of icons) {
      svgConfigMap$.next({
        key,
        type: 'set',
        value: {type: 'embed', content},
      });
    }
  },
  dependencies: [
    IconWithText,
    TextIconButton,
  ],
  tag: 'pbd-drawer',
  template,
})
export class Drawer extends ThemedCustomElementCtrl {
  private readonly onRootClick$ = _p.input($.root._.onClick, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.components._.contents).withValue(createRepeatedSpecs(COMPONENT_LINK_CONFIGS)),
      _p.render($.layouts._.contents).withValue(createRepeatedSpecs(LAYOUT_LINK_CONFIGS)),
      this.setupRootOnClick(),
    ];
  }

  private setupRootOnClick(): InitFn {
    return vine => this.onRootClick$
        .pipe(
            map(event => {
              if (!(event.target instanceof HTMLElement)) {
                return null;
              }

              return event.target.getAttribute('path') || null;
            }),
            filterNonNull(),
            withLatestFrom($locationService.get(vine)),
            switchMap(([path, locationService]) => locationService.goToPath(path, {})),
        );
  }
}

function createRepeatedSpecs(linkConfig: LinkConfig[]): ArrayDiff<RepeatedSpec> {
  const specs: RepeatedSpec[] = linkConfig.map(({label, path}) => {
    return {
      attr: new Map([['label', label], ['path', path]]),
    };
  });

  return {
    type: 'init',
    value: specs,
  };
}
