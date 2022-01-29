import {assertByType, filterNonNullable} from 'gs-tools/export/rxjs';
import {enumType} from 'gs-types';
import {BUTTON, ICON, LINE_LAYOUT, registerSvg, renderTheme} from 'mask';
import {Context, Ctrl, DIV, id, ievent, iflag, omulti, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';

import template from './drawer.html';
import {$locationService, Views} from './location-service';
import {CONTAINER_LINK_CONFIGS, LAYOUT_LINK_CONFIGS, PageSpec, PIECE_LINK_CONFIGS} from './page-spec';


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
      linkConfig: readonly PageSpec[],
  ): Observable<readonly RenderSpec[]> {
    const node$list = linkConfig.map(({label, path}) => {
      return renderCustomElement({
        registration: BUTTON,
        children: of([
          renderCustomElement({
            registration: LINE_LAYOUT,
            attrs: new Map([['path', of(path)]]),
            inputs: {},
            textContent: of(label),
            id: label,
          }),
        ]),
        inputs: {isSecondary: of(true)},
        id: label,
      });
    });

    return of(node$list);
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