import {assertByType, filterNonNullable} from 'gs-tools/export/rxjs';
import {enumType, instanceofType} from 'gs-types';
import {$button, $lineLayout, BaseThemedCtrl, Icon, LineLayout, registerSvg, _p} from 'mask';
import {attributeIn, booleanParser, element, host, multi, onDom, PersonaContext, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';

import template from './drawer.html';
import {$locationService, Views} from './location-service';


export const $drawer = {
  tag: 'pbd-drawer',
  api: {
    drawerExpanded: attributeIn('drawer-expanded', booleanParser(), false),
  },
};


const $ = {
  host: host($drawer.api),
  root: element('root', instanceofType(HTMLDivElement), {
    containers: multi('#containers'),
    layouts: multi('#layouts'),
    onClick: onDom('click'),
    pieces: multi('#pieces'),
  }),
};

interface LinkConfig {
  label: string;
  path: Views;
}

const CONTAINER_LINK_CONFIGS: LinkConfig[] = [
  {label: 'Deck', path: Views.DECK},
];

const LAYOUT_LINK_CONFIGS: LinkConfig[] = [
  // {label: 'Free', path: Views.FREE_LAYOUT},
  // {label: 'Grid', path: Views.GRID_LAYOUT},
];

const PIECE_LINK_CONFIGS: LinkConfig[] = [
  {label: 'D1', path: Views.D1},
  {label: 'D2', path: Views.D2},
  {label: 'D6', path: Views.D6},
];

@_p.customElement({
  ...$drawer,
  configure: vine => {
    registerSvg(vine, 'chevron_down', {type: 'embed', content: chevronDownSvg});
  },
  dependencies: [
    Icon,
    LineLayout,
  ],
  template,
})
export class Drawer extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(this.setupRootOnClick());
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.layouts(this.createNodes(LAYOUT_LINK_CONFIGS)),
      this.renderers.root.pieces(this.createNodes(PIECE_LINK_CONFIGS)),
      this.renderers.root.containers(this.createNodes(CONTAINER_LINK_CONFIGS)),
    ];
  }

  private createNodes(
      linkConfig: readonly LinkConfig[],
  ): Observable<readonly RenderSpec[]> {
    const node$list = linkConfig.map(({label, path}) => {
      return renderCustomElement({
        spec: $button,
        children: [renderCustomElement({
          spec: $lineLayout,
          attrs: new Map([['path', path]]),
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
    return this.inputs.root.onClick
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
              $locationService.get(this.vine).goToPath(path, {});
            }),
        );
  }
}
