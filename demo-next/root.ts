import {cache} from 'gs-tools/export/data';
import {OVERLAY, renderTheme, ROOT_LAYOUT} from 'mask';
import {Context, Ctrl, id, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {ACTIVE} from '../src-next/core/active';
import {SLOT} from '../src-next/region/slot';

import {$state$} from './demo-state';
import template from './root.html';


const $root = {
  shadow: {
    active: id('active', ACTIVE, {}),
    // drawer: id('drawer', DRAWER, {}),
    root: id('root', ROOT_LAYOUT),
    slot1: id('slot1', SLOT),
    slot2: id('slot2', SLOT),
    slot3: id('slot3', SLOT),
    slot4: id('slot4', SLOT),
    slot5: id('slot5', SLOT),
    slot6: id('slot6', SLOT),
  },
};


// const $stateId = rootStateIdSource<State>(() => ({
//   slot1: slotSpec({}),
//   slot2: slotSpec({}),
//   slot3: slotSpec({}),
//   slot4: slotSpec({}),
//   slot5: slotSpec({}),
//   slot6: slotSpec({}),
// }));


export class Root implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine);

  constructor(private readonly $: Context<typeof $root>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      // this.renderers.drawer.drawerExpanded(
      //     this.inputs.root.drawerExpanded.pipe(
      //         map(expanded => expanded ?? false),
      //     ),
      // ),
      renderTheme(this.$),
      of(this.state$._('slot1')).pipe(this.$.shadow.slot1.state()),
      of(this.state$._('slot2')).pipe(this.$.shadow.slot2.state()),
      of(this.state$._('slot3')).pipe(this.$.shadow.slot3.state()),
      of(this.state$._('slot4')).pipe(this.$.shadow.slot4.state()),
      of(this.state$._('slot5')).pipe(this.$.shadow.slot5.state()),
      of(this.state$._('slot6')).pipe(this.$.shadow.slot6.state()),
    ];
  }

  // @cache()
  // private get handleOnRootActive$(): Observable<unknown> {
  //   return this.inputs.root.onTitleClick
  //       .pipe(
  //           tap(() => {
  //             $locationService.get(this.vine).goToPath(Views.INSTRUCTION, {});
  //           }),
  //       );
  // }
}

export const ROOT = registerCustomElement({
  ctrl: Root,
  deps: [
    ACTIVE,
    ROOT_LAYOUT,
    SLOT,
    OVERLAY,
    // Documentation,
    // Drawer,
    // HelpOverlay,
    // LensDisplay,
  ],
  spec: $root,
  tag: 'pbd-root',
  template,
});