import { Vine } from 'grapevine';
import { $svgConfig, $textIconButton, _p, ACTION_EVENT, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, onDom, stringParser } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import addSvg from '../asset/add.svg';
import { $playAreaService, LayoutSpec } from '../play/play-area-service';

import { $$ as $docTemplate, DocTemplate } from './doc-template';
import template from './layout-template.html';


type SetLayoutFn = (spec: LayoutSpec) => void;
const SET_LAYOUT_EVENT = 'pbd-setLayout';

export class SetLayoutEvent extends Event {
  constructor(readonly setLayout: SetLayoutFn) {
    super(SET_LAYOUT_EVENT, {bubbles: true});
  }
}

export const $$ = {
  onSetLayout: dispatcher<SetLayoutEvent>(SET_LAYOUT_EVENT),
  label: attributeIn('label', stringParser()),
};

const $ = {
  setLayoutButton: element('setLayout', $textIconButton, {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: element($$),
  template: element('template', $docTemplate, {}),
};

@_p.customElement({
  dependencies: [
    DocTemplate,
    TextIconButton,
  ],
  tag: 'pbd-layout-template',
  template,
  configure(vine: Vine): void {
    $svgConfig.get(vine).next({
      key: 'add',
      type: 'set',
      value: {type: 'embed', content: addSvg},
    });
  },
})
export class LayoutTemplate extends ThemedCustomElementCtrl {
  private readonly label$ = this.declareInput($.host._.label);
  private readonly onSetLayout$ = new Subject<LayoutSpec>();

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.host._.onSetLayout).withFunction(this.renderOnAddClick);
    this.render($.template._.label).withObservable(this.label$);
    this.setupHandleSetLayout();
  }

  private renderOnAddClick(): Observable<SetLayoutEvent> {
    return this.declareInput($.setLayoutButton._.onAddClick)
        .pipe(
            map(() => new SetLayoutEvent(spec => this.onSetLayout$.next(spec))),
        );
  }

  private setupHandleSetLayout(): void {
    this.onSetLayout$.pipe(
        withLatestFrom($playAreaService.get(this.vine)),
        takeUntil(this.onDispose$),
    )
    .subscribe(([layoutSpec, playAreaService]) => {
      playAreaService.setLayout(layoutSpec);
    });
  }
}
