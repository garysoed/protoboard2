import { Vine } from 'grapevine';
import { $textIconButton, _p, ACTION_EVENT, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, host, onDom, PersonaContext, stringParser } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import addSvg from '../asset/add.svg';
// import { $playAreaService, LayoutSpec } from '../play/play-area-service';

import { $documentationTemplate, DocumentationTemplate } from './documentation-template';
import template from './layout-template.html';


// type SetLayoutFn = (spec: LayoutSpec) => void;
const SET_LAYOUT_EVENT = 'pbd-setLayout';

// export class SetLayoutEvent extends Event {
//   constructor(readonly setLayout: SetLayoutFn) {
//     super(SET_LAYOUT_EVENT, {bubbles: true});
//   }
// }

export const $$ = {
  tag: 'pbd-layout-template',
  api: {
    // onSetLayout: dispatcher<SetLayoutEvent>(SET_LAYOUT_EVENT),
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  setLayoutButton: element('setLayout', $textIconButton, {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: host($$.api),
  template: element('template', $documentationTemplate, {}),
};

@_p.customElement({
  ...$$,
  dependencies: [
    DocumentationTemplate,
    TextIconButton,
  ],
  template,
  configure(vine: Vine): void {
    registerSvg(vine, 'add', {type: 'embed', content: addSvg});
  },
})
export class LayoutTemplate extends ThemedCustomElementCtrl {
  private readonly label$ = this.declareInput($.host._.label);
  // private readonly onSetLayout$ = new Subject<LayoutSpec>();

  constructor(context: PersonaContext) {
    super(context);

    // this.render($.host._.onSetLayout, this.renderOnAddClick());
    this.render($.template._.label, this.label$);
    // this.addSetup(this.setupHandleSetLayout());
  }

  // private renderOnAddClick(): Observable<SetLayoutEvent> {
  //   return this.declareInput($.setLayoutButton._.onAddClick)
  //       .pipe(
  //           map(() => new SetLayoutEvent(spec => this.onSetLayout$.next(spec))),
  //       );
  // }

  // private setupHandleSetLayout(): Observable<unknown> {
  //   return this.onSetLayout$.pipe(
  //       withLatestFrom($playAreaService.get(this.vine)),
  //       tap(([layoutSpec, playAreaService]) => {
  //         playAreaService.setLayout(layoutSpec);
  //       }),
  //   );
  // }
}
