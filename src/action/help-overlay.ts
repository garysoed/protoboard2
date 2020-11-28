import {$asArray, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {$keyboard, BaseThemedCtrl, Keyboard, SpecialKeys, _p} from 'mask';
import {classToggle, element, multi, NodeWithId, onDom, PersonaContext, renderCustomElement, renderElement} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec, TriggerType} from '../core/trigger-spec';

import template from './help-overlay.html';
import {$helpService} from './help-service';


export const $helpOverlay = {
  tag: 'pb-help-overlay',
  api: {},
};

export const $ = {
  content: element('content', instanceofType(HTMLTableSectionElement), {
    rows: multi('#rows'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    click: onDom('click'),
    isVisibleClass: classToggle('isVisible'),
  }),
  template: element('tableRow', instanceofType(HTMLTemplateElement), {}),
};

@_p.customElement({
  ...$helpOverlay,
  template,
  dependencies: [Keyboard],
})
export class HelpOverlay extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
    this.addSetup(this.setupHandleClick());
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.isVisibleClass(this.isVisible$),
      this.renderers.content.rows(this.tableRows$),
    ];
  }

  private get isVisible$(): Observable<boolean> {
    return $helpService.get(this.vine).pipe(
        switchMap(service => service.actions$),
        map(actions => actions.length > 0),
    );
  }

  private setupHandleClick(): Observable<unknown> {
    return this.inputs.root.click
        .pipe(
            withLatestFrom($helpService.get(this.vine)),
            tap(([, service]) => service.hide()),
        );
  }

  @cache()
  private get tableRows$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    return $helpService.get(this.vine).pipe(
        switchMap(service => service.actions$),
        switchMap(actions => {
          const rows$list = $pipe(
              actions,
              $map(({action, trigger}) => {
                const keyboardEl$ = renderCustomElement(
                    $keyboard,
                    {
                      attrs: new Map([['a', observableOf('test')]]),
                      inputs: {text: observableOf(triggerKeySpecToString(trigger))},
                    },
                    {},
                    this.context,
                );
                const triggerEl$ = renderElement(
                    'td',
                    {children: combineLatest([keyboardEl$])},
                    {},
                    this.context,
                );

                const actionEl$ = renderElement(
                    'td',
                    {textContent: observableOf(action.actionName)},
                    {},
                    this.context,
                );
                return renderElement(
                    'tr',
                    {children: combineLatest([triggerEl$, actionEl$])},
                    {},
                    this.context,
                );
              }),
              $asArray(),
          );

          if (rows$list.length <= 0) {
            return observableOf([]);
          }

          return combineLatest(rows$list);
        }),
    );
  }
}

function triggerKeySpecToString(triggerSpec: TriggerSpec): string {
  if (typeof triggerSpec === 'string') {
    return triggerTypeToString(triggerSpec);
  }

  const keys: string[] = [];
  if (triggerSpec.alt) {
    keys.push(SpecialKeys.ALT);
  }

  if (triggerSpec.ctrl) {
    keys.push(SpecialKeys.CTRL);
  }

  if (triggerSpec.meta) {
    keys.push(SpecialKeys.META);
  }

  if (triggerSpec.shift) {
    keys.push(SpecialKeys.SHIFT);
  }

  keys.push(triggerKeySpecToString(triggerSpec.type));
  return keys.join(' ');
}

function triggerTypeToString(triggerType: TriggerType): string {
  if (triggerType === TriggerType.CLICK) {
    return '(click)';
  }

  return triggerType;
}
