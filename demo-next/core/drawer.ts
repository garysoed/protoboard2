import {assertByType, filterNonNullable} from 'gs-tools/export/rxjs';
import {enumType} from 'gs-types';
import {BUTTON, ICON, LINE_LAYOUT, registerSvg, renderTheme} from 'mask';
import {Context, Ctrl, DIV, id, ievent, iflag, omulti, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';

import template from './drawer.html';
import {$locationService, Views} from './location-service';


export const $drawer = {
  host: {
    drawerExpanded: iflag('drawer-expanded'),
  },
  shadow: {
    root: id('root', DIV, {
      containers: omulti('#containers'),
      layouts: omulti('#layouts'),
      onClick: ievent('click', Event),
      pieces: omulti('#pieces'),
    }),
  },
};


interface LinkConfig {
  label: string;
  path: Views;
}

const CONTAINER_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Deck', path: Views.DECK},
  {label: 'Slot', path: Views.SLOT},
];

const LAYOUT_LINK_CONFIGS: LinkConfig[] = [
  // {label: 'Free', path: Views.FREE_LAYOUT},
  // {label: 'Grid', path: Views.GRID_LAYOUT},
];

const PIECE_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Canvas', path: Views.CANVAS},
  {label: 'D1', path: Views.D1},
  {label: 'D2', path: Views.D2},
  {label: 'D6', path: Views.D6},
];

export class Drawer implements Ctrl {
  constructor(private readonly $: Context<typeof $drawer>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.setupRootOnClick(),
      this.createNodes(LAYOUT_LINK_CONFIGS).pipe(this.$.shadow.root.layouts()),
      this.createNodes(PIECE_LINK_CONFIGS).pipe(this.$.shadow.root.pieces()),
      this.createNodes(CONTAINER_LINK_CONFIGS).pipe(this.$.shadow.root.containers()),
    ];
  }

  private createNodes(
      linkConfig: readonly LinkConfig[],
  ): Observable<readonly RenderSpec[]> {
    const node$list = linkConfig.map(({label, path}) => {
      return renderCustomElement({
        registration: BUTTON,
        children: [renderCustomElement({
          registration: LINE_LAYOUT,
          attrs: new Map([['path', path]]),
          inputs: {},
          textContent: label,
          id: label,
        })],
        inputs: {isSecondary: true},
        id: label,
      });
    });

    return observableOf(node$list);
  }

  private setupRootOnClick(): Observable<unknown> {
    return this.$.shadow.root.onClick
        .pipe(
            map(event => {
              if (!(event.target instanceof HTMLElement)) {
                return null;
              }

              return event.target.getAttribute('path') || null;
            }),
            filterNonNullable(),
            assertByType(enumType<Views>(Views)),
            tap(path => {
              $locationService.get(this.$.vine).goToPath(path, {});
            }),
        );
  }
}

export const DRAWER = registerCustomElement({
  ctrl: Drawer,
  configure: vine => {
    registerSvg(vine, 'chevron_down', {type: 'embed', content: chevronDownSvg});
  },
  deps: [
    ICON,
    LINE_LAYOUT,
  ],
  spec: $drawer,
  tag: 'pbd-drawer',
  template,
});