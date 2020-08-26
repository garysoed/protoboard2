import { cache } from 'gs-tools/export/data';
import { elementWithTagType, instanceofType } from 'gs-types';
import { $rootLayout, _p, RootLayout, ThemedCustomElementCtrl } from 'mask';
import { api, classToggle, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Active } from '../src/region/active';

import { Documentation } from './core/documentation';
import { $drawer, Drawer } from './core/drawer';
import { $locationService, Views } from './core/location-service';
import { PlayArea } from './core/play-area';
import { StagingArea } from './core/staging-area';
import { $stagingService } from './core/staging-service';
import template from './root.html';


// import { HelpOverlay } from '../src-old/action/help-overlay';


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
    // HelpOverlay,
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
    return $stagingService.get(this.vine).pipe(
        switchMap(service => service.isStaging$),
        map(isStaging => !isStaging),
    );
  }
}
