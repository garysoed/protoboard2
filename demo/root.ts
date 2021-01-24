import {cache} from 'gs-tools/export/data';
import {elementWithTagType, instanceofType} from 'gs-types';
import {$rootLayout, BaseThemedCtrl, Overlay, RootLayout, _p} from 'mask';
import {api, classToggle, element, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {HelpOverlay} from '../src/action/help-overlay';
import {$active, Active} from '../src/core/active';
import {$activeId} from '../src/objects/getters/root-state';

import {Documentation} from './core/documentation';
import {$drawer, Drawer} from './core/drawer';
import {$locationService, Views} from './core/location-service';
import {PlayArea} from './core/play-area';
import {StagingArea} from './core/staging-area';
import template from './root.html';
import {$isStaging} from './state/getters/demo-state';


const $ = {
  active: element('active', $active, {}),
  drawer: element('drawer', $drawer, {}),
  main: element('main', instanceofType(HTMLDivElement), {
    isPlaying: classToggle('isPlaying'),
  }),
  root: element('root', elementWithTagType('mk-root-layout'), api($rootLayout.api)),
};

@_p.customElement({
  dependencies: [
    Active,
    Documentation,
    Drawer,
    HelpOverlay,
    Overlay,
    PlayArea,
    RootLayout,
    StagingArea,
  ],
  tag: 'pbd-root',
  template,
  api: {},
})
export class Root extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
    this.addSetup(this.handleOnRootActive$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.active.objectId($activeId.get(this.vine).pipe(map(id => id ?? undefined))),
      this.renderers.drawer.drawerExpanded(
          this.inputs.root.drawerExpanded.pipe(
              map(expanded => expanded ?? false),
          ),
      ),
      this.renderers.main.isPlaying(this.isPlaying$),
    ];
  }

  @cache()
  private get handleOnRootActive$(): Observable<unknown> {
    return this.inputs.root.onTitleClick
        .pipe(
            withLatestFrom($locationService.get(this.vine)),
            tap(([, service]) => {
              service.goToPath(Views.INSTRUCTION, {});
            }),
        );
  }

  @cache()
  private get isPlaying$(): Observable<boolean> {
    return $isStaging.get(this.vine).pipe(map(isStaging => !isStaging));
  }
}
