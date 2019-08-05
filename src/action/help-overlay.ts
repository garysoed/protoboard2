import { ArrayDiff, scanArray } from '@gs-tools/rxjs';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { _p, _v, ThemedCustomElementCtrl } from '@mask';
import { classToggle, element, InitFn, innerHtml, onDom, renderFromTemplate, RenderSpec, repeated, style } from '@persona';
import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map, switchMap, tap, withLatestFrom } from '@rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerSpec, TriggerType } from '../core/trigger-spec';

import template from './help-overlay.html';
import { $helpService } from './help-service';


export const $ = {
  content: element('content', InstanceofType(HTMLTableSectionElement), {
    rows: repeated('#content'),
  }),
  root: element('root', InstanceofType(HTMLDivElement), {
    click: onDom('click'),
    isVisibleClass: classToggle('isVisible'),
  }),
  template: element('tableRow', InstanceofType(HTMLTemplateElement), {}),
};

const $template = {
  action: element('action', ElementWithTagType('td'), {
    inner: innerHtml(),
  }),
  trigger: element('trigger', ElementWithTagType('td'), {
    inner: innerHtml(),
  }),
};

@_p.customElement({
  tag: 'pb-help-overlay',
  template,
})
export class HelpOverlay extends ThemedCustomElementCtrl {
  private readonly helpService$ = $helpService.asSubject();
  private readonly onRootClick$ = _p.input($.root._.click, this);
  private readonly tableRowTemplate$ = _p.input($.template, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.content._.rows).withVine(_v.stream(this.renderRows, this)),
      _p.render($.root._.isVisibleClass).withVine(_v.stream(this.renderIsVisible, this)),
      () => this.setupHandleClick(),
    ];
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
        switchMap(([diff, template]): Observable<ArrayDiff<RenderSpec>> => {
          switch (diff.type) {
            case 'delete':
              return observableOf(diff);
            case 'init':
              return combineLatest(diff.value.map(action => renderRow(action, template))).pipe(
                  map(value => ({type: 'init', value})),
              );
            case 'insert':
              return renderRow(diff.value, template).pipe(
                  map(value => ({type: 'insert', value, index: diff.index})),
              );
            case 'set':
              return renderRow(diff.value, template).pipe(
                  map(value => ({type: 'set', value, index: diff.index})),
              );
          }
        }),
    );
  }

  private setupHandleClick(): Observable<unknown> {
    return this.onRootClick$.pipe(
        withLatestFrom(this.helpService$),
        tap(([, service]) => service.hide()),
    );
  }
}

function renderRow(action: BaseAction, template: HTMLTemplateElement): Observable<RenderSpec> {
  return action.triggerSpec$.pipe(
      map(trigger => {
        return renderFromTemplate(template)
            .addOutput($template.trigger._.inner, renderTrigger(trigger))
            .addOutput($template.action._.inner, action.actionName)
            .build();
      }),
  );
}

function renderTrigger(spec: TriggerSpec): string {
  switch (spec.type) {
    case TriggerType.KEY:
      return spec.key;
    case TriggerType.CLICK:
      return 'click';
  }
}
