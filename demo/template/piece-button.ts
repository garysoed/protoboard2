import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {$icon, _p, ACTION_EVENT, ActionEvent, ThemedCustomElementCtrl} from 'mask';
import {attributeIn, dispatcher, element, host, onDom, PersonaContext, setAttribute, stringParser} from 'persona';
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
  root: element('root', instanceofType(HTMLDivElement), {
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  ...$pieceButton,
  template,
})
export class PieceButton extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.icon._.icon, this.declareInput($.host._.icon));
    this.render($.host._.onClick, this.onClick$);
    this.render($.host._.mkAction, observableOf(true));
  }

  @cache()
  private get onClick$(): Observable<ClickEvent> {
    return this.declareInput($.root._.onClick).pipe(
        withLatestFrom(this.declareInput($.host._.icon)),
        map(([, icon]) => new ActionEvent({icon})),
    );
  }
}
