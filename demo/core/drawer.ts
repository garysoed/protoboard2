import { Vine } from 'grapevine';
import { ArrayDiff, assertByType, filterNonNull } from 'gs-tools/export/rxjs';
import { enumType, instanceofType } from 'gs-types';
import { $svgConfig, _p, IconWithText, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, booleanParser, element, onDom, RenderSpec, repeated, SimpleElementRenderSpec } from 'persona';
import { map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';
import { $locationService, Views } from '../location-service';

import template from './drawer.html';


export const $$ = {
  api: {
    drawerExpanded: attributeIn('drawer-expanded', booleanParser(), false),
  },
};


const $ = {
  components: element('components', instanceofType(HTMLDivElement), {
    contents: repeated('#contents'),
  }),
  host: element($$.api),
  layouts: element('layouts', instanceofType(HTMLDivElement), {
    contents: repeated('#contents'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    onClick: onDom('click'),
  }),
  zones: element('zones', instanceofType(HTMLDivElement), {
    contents: repeated('#contents'),
  }),
};

interface LinkConfig {
  label: string;
  path: Views;
}

const COMPONENT_LINK_CONFIGS: LinkConfig[] = [
  {label: 'D1', path: Views.D1},
  {label: 'D2', path: Views.D2},
];

const LAYOUT_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Free', path: Views.FREE_LAYOUT},
  {label: 'Grid', path: Views.GRID_LAYOUT},
];

const ZONE_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Deck', path: Views.DECK},
  {label: 'Slot', path: Views.SLOT},
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
    this.render($.zones._.contents).withValue(createRepeatedSpecs(ZONE_LINK_CONFIGS));
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
            assertByType(enumType<Views>(Views)),
            withLatestFrom($locationService.get(this.vine)),
            tap(([path, locationService]) => {
              locationService.goToPath(path, {});
            }),
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
