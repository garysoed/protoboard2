import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { classToggle, element, onDom, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import template from './help-overlay.html';
import { $helpService } from './help-service';


export const $ = {
  content: element('content', instanceofType(HTMLTableSectionElement), {}),
  root: element('root', instanceofType(HTMLDivElement), {
    click: onDom('click'),
    isVisibleClass: classToggle('isVisible'),
  }),
  template: element('tableRow', instanceofType(HTMLTemplateElement), {}),
};

@_p.customElement({
  tag: 'pb-help-overlay',
  template,
  api: {},
})
export class HelpOverlay extends ThemedCustomElementCtrl {
  private readonly helpService$ = $helpService.get(this.vine);
  private readonly onRootClick$ = this.declareInput($.root._.click);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.root._.isVisibleClass, this.renderIsVisible());
    this.addSetup(this.setupTableRows());
    this.addSetup(this.setupHandleClick());
  }

  private renderIsVisible(): Observable<boolean> {
    return this.helpService$.pipe(
        switchMap(service => service.actions$),
        map(actions => actions.length > 0),
    );
  }

  private setupHandleClick(): Observable<unknown> {
    return this.onRootClick$
        .pipe(
            withLatestFrom(this.helpService$),
            tap(([, service]) => service.hide()),
        );
  }

  private setupTableRows(): Observable<unknown> {
    return this.helpService$.pipe(
        switchMap(service => service.actions$),
        withLatestFrom(this.declareInput($.content)),
        tap(([actions, contentEl]) => {
          contentEl.innerHTML = '';
          for (const {action, trigger} of actions) {
            const rowEl = document.createElement('tr');
            const triggerEl = document.createElement('td');
            triggerEl.textContent = trigger;
            const actionEl = document.createElement('td');
            actionEl.textContent = action.actionName;

            rowEl.appendChild(triggerEl);
            rowEl.appendChild(actionEl);
            contentEl.appendChild(rowEl);
          }
        }),
    );
  }
}
