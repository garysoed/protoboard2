import {cache} from 'gs-tools/export/data';
import {$icon, ActionEvent, ACTION_EVENT, BaseThemedCtrl, _p} from 'mask';
import {$div, attributeIn, dispatcher, element, host, integerParser, onDom, PersonaContext, stringParser} from 'persona';
import {EMPTY, Observable, of as observableOf} from 'rxjs';
import {switchMap, withLatestFrom} from 'rxjs/operators';

import template from './piece-preview.html';


export type ClickEvent = ActionEvent<{readonly index: number}>;

export const $piecePreview = {
  tag: 'pbd-piece-preview',
  api: {
    icon: attributeIn('icon', stringParser(), ''),
    index: attributeIn('index', integerParser()),
    onClick: dispatcher<ClickEvent>(ACTION_EVENT),
  },
};

const $ = {
  host: host($piecePreview.api),
  icon: element('icon', $icon, {}),
  root: element('root', $div, {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$piecePreview,
  template,
})
export class PiecePreview extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.icon.icon(this.inputs.host.icon),
      this.renderers.host.onClick(this.onClick$),
    ];
  }

  @cache()
  private get onClick$(): Observable<ClickEvent> {
    return this.inputs.root.onClick.pipe(
        withLatestFrom(this.inputs.host.index),
        switchMap(([, index]) => {
          if (index === undefined) {
            return EMPTY;
          }
          return observableOf(new ActionEvent({index}));
        }),
    );
  }
}
