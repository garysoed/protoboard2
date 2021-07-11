import {immutablePathSource, rootStateIdSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {elementWithTagType} from 'gs-types';
import {$rootLayout, BaseThemedCtrl, Overlay, RootLayout, _p} from 'mask';
import {api, element, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {$slot, LensDisplay, Slot, slotSpec, SlotSpec} from '../export';
import {HelpOverlay} from '../src/action/help-overlay';
import {$active, Active} from '../src/core/active';
import {$activeSpecPath} from '../src/core/active-spec';

import {Documentation} from './core/documentation';
import {$drawer, Drawer} from './core/drawer';
import {$locationService, Views} from './core/location-service';
import template from './root.html';


const $ = {
  active: element('active', $active, {}),
  drawer: element('drawer', $drawer, {}),
  root: element('root', elementWithTagType('mk-root-layout'), api($rootLayout.api)),
  slot1: element('slot1', $slot, {}),
  slot2: element('slot2', $slot, {}),
  slot3: element('slot3', $slot, {}),
  slot4: element('slot4', $slot, {}),
  slot5: element('slot5', $slot, {}),
  slot6: element('slot6', $slot, {}),
};

interface State {
  readonly slot1: SlotSpec;
  readonly slot2: SlotSpec;
  readonly slot3: SlotSpec;
  readonly slot4: SlotSpec;
  readonly slot5: SlotSpec;
  readonly slot6: SlotSpec;
}

const $stateId = rootStateIdSource<State>(() => ({
  slot1: slotSpec({}),
  slot2: slotSpec({}),
  slot3: slotSpec({}),
  slot4: slotSpec({}),
  slot5: slotSpec({}),
  slot6: slotSpec({}),
}));

const $slot1Path = immutablePathSource($stateId, state => state._('slot1'));
const $slot2Path = immutablePathSource($stateId, state => state._('slot2'));
const $slot3Path = immutablePathSource($stateId, state => state._('slot3'));
const $slot4Path = immutablePathSource($stateId, state => state._('slot4'));
const $slot5Path = immutablePathSource($stateId, state => state._('slot5'));
const $slot6Path = immutablePathSource($stateId, state => state._('slot6'));

@_p.customElement({
  dependencies: [
    Active,
    Documentation,
    Drawer,
    HelpOverlay,
    Overlay,
    LensDisplay,
    RootLayout,
    Slot,
  ],
  tag: 'pbd-root',
  template,
  api: {},
})
export class Root extends BaseThemedCtrl<typeof $> {
  private readonly state = $stateId.get(this.context.vine);

  constructor(context: PersonaContext) {
    super(context, $);
    this.addSetup(this.handleOnRootActive$);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.active.objectPath(of($activeSpecPath.get(this.vine))),
      this.renderers.drawer.drawerExpanded(
          this.inputs.root.drawerExpanded.pipe(
              map(expanded => expanded ?? false),
          ),
      ),
      this.renderers.slot1.objectPath(of($slot1Path.get(this.vine))),
      this.renderers.slot2.objectPath(of($slot2Path.get(this.vine))),
      this.renderers.slot3.objectPath(of($slot3Path.get(this.vine))),
      this.renderers.slot4.objectPath(of($slot4Path.get(this.vine))),
      this.renderers.slot5.objectPath(of($slot5Path.get(this.vine))),
      this.renderers.slot6.objectPath(of($slot6Path.get(this.vine))),
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
}
