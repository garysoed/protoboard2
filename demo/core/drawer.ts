import {assertByType, filterNonNull} from 'gs-tools/export/rxjs';
import {enumType, instanceofType} from 'gs-types';
import {$button, $lineLayout, _p, Icon, LineLayout, registerSvg, ThemedCustomElementCtrl} from 'mask';
import {attributeIn, booleanParser, element, host, multi, NodeWithId, onDom, PersonaContext, renderCustomElement} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

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
export class Drawer extends ThemedCustomElementCtrl {
  private readonly onRootClick$ = this.declareInput($.root._.onClick);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.root._.layouts, this.createNodes(LAYOUT_LINK_CONFIGS));
    this.render($.root._.pieces, this.createNodes(PIECE_LINK_CONFIGS));
    this.render($.root._.containers, this.createNodes(CONTAINER_LINK_CONFIGS));
    this.addSetup(this.setupRootOnClick());
  }

  private createNodes(
      linkConfig: readonly LinkConfig[],
  ): Observable<ReadonlyArray<NodeWithId<Node>>> {
    const node$list = linkConfig.map(({label, path}) => {
      return renderCustomElement(
          $button,
          {
            children: renderCustomElement(
                $lineLayout,
                {
                  attrs: new Map([['path', observableOf(path)]]),
                  textContent: observableOf(label),
                },
                label,
                this.context,
            ).pipe(map(node => [node])),
            inputs: {isSecondary: observableOf(true)},
          },
          label,
          this.context,
      );
    });

    return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
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
