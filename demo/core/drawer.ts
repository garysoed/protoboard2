import { ArrayDiff, assertByType, filterNonNull } from 'gs-tools/export/rxjs';
import { enumType, instanceofType } from 'gs-types';
import { $textIconButton, _p, IconWithText, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, booleanParser, element, host, multi, onDom, PersonaContext, renderCustomElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';

import template from './drawer.html';
import { $locationService, Views } from './location-service';


export const $drawer = {
  tag: 'pbd-drawer',
  api: {
    drawerExpanded: attributeIn('drawer-expanded', booleanParser(), false),
  },
};


const $ = {
  host: host($drawer.api),
  containers: element('containers', instanceofType(HTMLDivElement), {
    contents: multi('#contents'),
  }),
  layouts: element('layouts', instanceofType(HTMLDivElement), {
    contents: multi('#contents'),
  }),
  pieces: element('pieces', instanceofType(HTMLDivElement), {
    contents: multi('#contents'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    onClick: onDom('click'),
  }),
};

interface LinkConfig {
  label: string;
  path: Views;
}

const CONTAINER_LINK_CONFIGS: LinkConfig[] = [
  // {label: 'Deck', path: Views.DECK},
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
    IconWithText,
    TextIconButton,
  ],
  template,
})
export class Drawer extends ThemedCustomElementCtrl {
  private readonly onRootClick$ = this.declareInput($.root._.onClick);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.layouts._.contents, this.createNodes(LAYOUT_LINK_CONFIGS));
    this.render($.pieces._.contents, this.createNodes(PIECE_LINK_CONFIGS));
    this.render($.containers._.contents, this.createNodes(CONTAINER_LINK_CONFIGS));
    this.addSetup(this.setupRootOnClick());
  }

  private createNodes(linkConfig: readonly LinkConfig[]): Observable<readonly Node[]> {
    const node$list = linkConfig.map(({label, path}) => {
      return renderCustomElement(
          $textIconButton,
          {
            inputs: {label: observableOf(label)},
            attrs: new Map([['path', observableOf(path)]]),
          },
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
