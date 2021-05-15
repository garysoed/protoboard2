import {cache} from 'gs-tools/export/data';
import {$icon, ActionEvent, ACTION_EVENT, BaseThemedCtrl, _p} from 'mask';
import {$div, attributeIn, dispatcher, element, host, onDom, PersonaContext, setAttribute, stringParser} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import template from './piece-button.html';


export type ClickEvent = ActionEvent<{readonly icon: string}>;

export const $pieceButton = {
  tag: 'pbd-piece-button',
  api: {
    onClick: dispatcher<ClickEvent>(ACTION_EVENT),
    icon: attributeIn('icon', stringParser(), ''),
  },
};

const $ = {
  host: host({
    ...$pieceButton.api,
    mkAction: setAttribute('mk-action-2'),
  }),
  icon: element('icon', $icon, {}),
  root: element('root', $div, {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$pieceButton,
  template,
})
export class PieceButton extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.icon.icon(this.inputs.host.icon),
      this.renderers.host.onClick(this.onClick$),
      this.renderers.host.mkAction(observableOf(true)),
    ];
  }

  @cache()
  private get onClick$(): Observable<ClickEvent> {
    return this.inputs.root.onClick.pipe(
        withLatestFrom(this.inputs.host.icon),
        map(([, icon]) => new ActionEvent({icon})),
    );
  }
}
