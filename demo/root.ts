import { $rootLayout, Overlay, RootLayout, ThemedCustomElementCtrl, _p } from 'mask';
import { Observable } from 'rxjs';
import { PersonaContext, api, classToggle, element } from 'persona';
import { cache } from 'gs-tools/export/data';
import { elementWithTagType, instanceofType } from 'gs-types';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { Active } from '../src/core/active';
import { HelpOverlay } from '../src/action/help-overlay';

import { $drawer, Drawer } from './core/drawer';
import { $isStaging } from './state/getters/demo-state';
import { $locationService, Views } from './core/location-service';
import { Documentation } from './core/documentation';
import { PlayArea } from './core/play-area';
import { StagingArea } from './core/staging-area';
import template from './root.html';


const $ = {
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
export class Root extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.handleOnRootActive$);
    this.render($.drawer._.drawerExpanded, this.declareInput($.root._.drawerExpanded));
    this.render($.main._.isPlaying, this.isPlaying$);
  }

  @cache()
  private get handleOnRootActive$(): Observable<unknown> {
    return this.declareInput($.root._.onTitleClick)
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
