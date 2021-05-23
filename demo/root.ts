import {$stateService, source} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {elementWithTagType} from 'gs-types';
import {$rootLayout, BaseThemedCtrl, Overlay, RootLayout, _p} from 'mask';
import {$div, api, classToggle, element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {$slot, LensDisplay, Slot, slotSpec, SlotSpec} from '../export';
import {HelpOverlay} from '../src/action/help-overlay';
import {$active, Active} from '../src/core/active';
import {$$activeSpec} from '../src/core/active-spec';

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
  main: element('main', $div, {
    isPlaying: classToggle('isPlaying'),
  }),
  root: element('root', elementWithTagType('mk-root-layout'), api($rootLayout.api)),
  slot1: element('slot1', $slot, {}),
  slot2: element('slot2', $slot, {}),
  slot3: element('slot3', $slot, {}),
  slot4: element('slot4', $slot, {}),
  slot5: element('slot5', $slot, {}),
  slot6: element('slot6', $slot, {}),
};

interface State {
  readonly $slot1: StateId<SlotSpec>;
  readonly $slot2: StateId<SlotSpec>;
  readonly $slot3: StateId<SlotSpec>;
  readonly $slot4: StateId<SlotSpec>;
  readonly $slot5: StateId<SlotSpec>;
  readonly $slot6: StateId<SlotSpec>;
}

const $state = source<State>('rootState', vine => $stateService.get(vine).modify(x => ({
  $slot1: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([])})),
  $slot2: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([])})),
  $slot3: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([])})),
  $slot4: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([])})),
  $slot5: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([])})),
  $slot6: x.add(slotSpec({type: 'slot', $contentSpecs: x.add([])})),
})));

@_p.customElement({
  dependencies: [
    Active,
    Documentation,
    Drawer,
    HelpOverlay,
    Overlay,
    LensDisplay,
    PlayArea,
    RootLayout,
    Slot,
    StagingArea,
  ],
  tag: 'pbd-root',
  template,
  api: {},
})
export class Root extends BaseThemedCtrl<typeof $> {
  private readonly state = $state.get(this.context.vine);

  constructor(context: PersonaContext) {
    super(context, $);
    this.addSetup(this.handleOnRootActive$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.active.objectId($$activeSpec.get(this.vine).pipe(map(id => id ?? undefined))),
      this.renderers.drawer.drawerExpanded(
          this.inputs.root.drawerExpanded.pipe(
              map(expanded => expanded ?? false),
          ),
      ),
      this.renderers.main.isPlaying(this.isPlaying$),
      this.renderers.slot1.objectId(of(this.state.$slot1)),
      this.renderers.slot2.objectId(of(this.state.$slot2)),
      this.renderers.slot3.objectId(of(this.state.$slot3)),
      this.renderers.slot4.objectId(of(this.state.$slot4)),
      this.renderers.slot5.objectId(of(this.state.$slot5)),
      this.renderers.slot6.objectId(of(this.state.$slot6)),
    ];
  }

  @cache()
  private get handleOnRootActive$(): Observable<unknown> {
    return this.inputs.root.onTitleClick
        .pipe(
            tap(() => {
              $locationService.get(this.vine).goToPath(Views.INSTRUCTION, {});
            }),
        );
  }

  @cache()
  private get isPlaying$(): Observable<boolean> {
    return $isStaging.get(this.vine).pipe(map(isStaging => !isStaging));
  }
}
