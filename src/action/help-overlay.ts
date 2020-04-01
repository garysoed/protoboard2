import { ArrayDiff, scanArray } from 'gs-tools/export/rxjs';
import { elementWithTagType, instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { classToggle, element, innerHtml, NoopRenderSpec, onDom, PersonaContext, renderFromTemplate, RenderSpec, repeated } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import template from './help-overlay.html';
import { $helpService, ActionTrigger } from './help-service';


export const $ = {
  content: element('content', instanceofType(HTMLTableSectionElement), {
    rows: repeated('#content'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    click: onDom('click'),
    isVisibleClass: classToggle('isVisible'),
  }),
  template: element('tableRow', instanceofType(HTMLTemplateElement), {}),
};

const $template = {
  action: element('action', elementWithTagType('td'), {
    inner: innerHtml(),
  }),
  trigger: element('trigger', elementWithTagType('td'), {
    inner: innerHtml(),
  }),
};

@_p.customElement({
  tag: 'pb-help-overlay',
  template,
})
export class HelpOverlay extends ThemedCustomElementCtrl {
  private readonly helpService$ = $helpService.get(this.vine);
  private readonly onRootClick$ = this.declareInput($.root._.click);
  private readonly tableRowTemplate$ = this.declareInput($.template);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.content._.rows).withFunction(this.renderRows);
    this.render($.root._.isVisibleClass).withFunction(this.renderIsVisible);
    this.setupHandleClick();
  }

  private renderIsVisible(): Observable<boolean> {
    return this.helpService$.pipe(
        switchMap(service => service.actions$),
        scanArray(),
        map(actions => actions.length > 0),
    );
  }

  private renderRows(): Observable<ArrayDiff<RenderSpec>> {
    return this.helpService$.pipe(
        switchMap(service => service.actions$),
        withLatestFrom(this.tableRowTemplate$),
        map(([diff, template]): ArrayDiff<RenderSpec> => {
          switch (diff.type) {
            case 'delete':
              return {
                type: 'delete',
                index: diff.index,
                value: new NoopRenderSpec(),
              };
            case 'init':
              return {
                type: 'init',
                value: diff.value.map(action => renderRow(action, template)),
              };
            case 'insert':
              return {
                type: 'insert',
                value: renderRow(diff.value, template),
                index: diff.index,
              };
            case 'set':
              return {
                type: 'set',
                value: renderRow(diff.value, template),
                index: diff.index,
              };
          }
        }),
    );
  }

  private setupHandleClick(): void {
    this.onRootClick$
        .pipe(
            withLatestFrom(this.helpService$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, service]) => service.hide());
  }
}

function renderRow(
    {action, trigger}: ActionTrigger,
    template: HTMLTemplateElement,
): RenderSpec {
  return renderFromTemplate(template)
      .addOutput($template.trigger._.inner, trigger)
      .addOutput($template.action._.inner, action.actionName)
      .build();
}
