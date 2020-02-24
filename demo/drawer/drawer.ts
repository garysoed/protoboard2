import { Vine } from 'grapevine';
import { ArrayDiff, filterNonNull } from 'gs-tools/export/rxjs';
import { InstanceofType } from 'gs-types';
import { $svgConfig, _p, booleanParser, IconWithText, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, onDom, RenderSpec, repeated, SimpleElementRenderSpec } from 'persona';
import { map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';
import { $locationService } from '../location-service';

import template from './drawer.html';


export const $$ = {
  api: {
    drawerExpanded: attributeIn('drawer-expanded', booleanParser(), false),
  },
};


const $ = {
  components: element('components', InstanceofType(HTMLDivElement), {
    contents: repeated('#contents'),
  }),
  host: element($$.api),
  layouts: element('layouts', InstanceofType(HTMLDivElement), {
    contents: repeated('#contents'),
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
  {label: 'D1', path: 'D1'},
];

const LAYOUT_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Free', path: 'FREE_LAYOUT'},
  {label: 'Grid', path: 'GRID_LAYOUT'},
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
  private readonly onRootClick$ = this.declareInput($.root._.onClick);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.components._.contents).withValue(createRepeatedSpecs(COMPONENT_LINK_CONFIGS));
    this.render($.layouts._.contents).withValue(createRepeatedSpecs(LAYOUT_LINK_CONFIGS));
    this.setupRootOnClick();
  }

  private setupRootOnClick(): void {
    this.onRootClick$
        .pipe(
            map(event => {
              if (!(event.target instanceof HTMLElement)) {
                return null;
              }

              return event.target.getAttribute('path') || null;
            }),
            filterNonNull(),
            withLatestFrom($locationService.get(this.vine)),
            switchMap(([path, locationService]) => locationService.goToPath(path, {})),
            takeUntil(this.onDispose$),
        )
        .subscribe();
  }
}

function createRepeatedSpecs(linkConfig: LinkConfig[]): ArrayDiff<RenderSpec> {
  const specs: RenderSpec[] = linkConfig.map(({label, path}) => {
    return new SimpleElementRenderSpec(
        'mk-text-icon-button',
        new Map([['label', label], ['path', path]]),
    );
  });

  return {
    type: 'init',
    value: specs,
  };
}
