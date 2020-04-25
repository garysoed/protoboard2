import { ArrayDiff, assertByType, filterNonNull } from 'gs-tools/export/rxjs';
import { enumType, instanceofType } from 'gs-types';
import { _p, IconWithText, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, booleanParser, element, onDom, PersonaContext, RenderSpec, repeated, SimpleElementRenderSpec } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

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
    registerSvg(vine, 'chevron_down', {type: 'embed', content: chevronDownSvg});
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

  constructor(context: PersonaContext) {
    super(context);

    this.render($.components._.contents, observableOf(createRepeatedSpecs(COMPONENT_LINK_CONFIGS)));
    this.render($.layouts._.contents, observableOf(createRepeatedSpecs(LAYOUT_LINK_CONFIGS)));
    this.render($.zones._.contents, observableOf(createRepeatedSpecs(ZONE_LINK_CONFIGS)));
    this.addSetup(this.setupRootOnClick());
  }

  private setupRootOnClick(): Observable<unknown> {
    return this.onRootClick$
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
        );
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
