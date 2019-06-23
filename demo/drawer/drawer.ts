import { ArrayDiff, filterNonNull } from '@gs-tools/rxjs';
import { InstanceofType } from '@gs-types';
import { _p, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, onDom, repeated, RepeatedSpec } from '@persona';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';
import { $locationService } from '../location-service';
import template from './drawer.html';

const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    contents: repeated('#contents', 'mk-text-icon-button'),
    onClick: onDom('click'),
  }),
};

interface LinkConfig {
  label: string;
  path: string;
}

const linkConfig: LinkConfig[] = [
  {label: 'Piece', path: 'PIECE'},
];

@_p.customElement({
  dependencies: [
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
      _p.render($.root._.contents).withValue(createRepeatedSpecs(linkConfig)),
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
