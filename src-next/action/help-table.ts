import {cache} from 'gs-tools/export/data';
import {KEYBOARD, renderTheme, SpecialKeys} from 'mask';
import {Context, Ctrl, H3, iattr, id, itarget, oforeach, otext, query, registerCustomElement, RenderSpec, renderTemplate, TBODY, TD, TEMPLATE} from 'persona';
import {combineLatest, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {TriggerSpec, TriggerType} from '../types/trigger-spec';

import {$helpService} from './help-service';
import template from './help-table.html';
import {ActionTrigger, ACTION_TRIGGER_TYPE, HelpContent} from './show-help-event';


const $helpTable = {
  host: {
    index: iattr('index'),
  },
  shadow: {
    _row: id('_row', TEMPLATE, {
      target: itarget(),
    }),
    title: id('title', H3, {
      text: otext(),
    }),
    content: id('content', TBODY, {
      rows: oforeach('#rows', ACTION_TRIGGER_TYPE),
    }),
  },
};

export class HelpTable implements Ctrl {
  constructor(private readonly $: Context<typeof $helpTable>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.title$.pipe(this.$.shadow.title.text()),
      this.rows$.pipe(this.$.shadow.content.rows(trigger => this.renderActionTrigger(trigger))),
    ];
  }

  @cache()
  private get content$(): Observable<HelpContent|null> {
    return combineLatest([
      $helpService.get(this.$.vine).contents$,
      this.$.host.index,
    ])
        .pipe(
            map(([contents, indexStr]) => {
              if (!indexStr) {
                return null;
              }

              const index = Number.parseInt(indexStr);
              return contents[index] ?? null;
            }),
        );
  }

  private renderActionTrigger({actionName, trigger}: ActionTrigger): Observable<RenderSpec|null> {
    return of(renderTemplate({
      template$: this.$.shadow._row.target as Observable<HTMLTemplateElement>,
      spec: {
        keyboard: query('mk-keyboard', KEYBOARD),
        action: query('td:nth-child(2)', TD, {
          text: otext(),
        }),
      },
      runs: $ => [
        of(triggerKeySpecToString(trigger)).pipe($.keyboard.text()),
        of(actionName).pipe($.action.text()),
      ],
    }));
  }

  @cache()
  private get rows$(): Observable<readonly ActionTrigger[]> {
    return this.content$.pipe(map(content => content?.actions ?? []));
  }

  @cache()
  private get title$(): Observable<string> {
    return this.content$.pipe(map(content => content?.componentName ?? '(Unknown)'));
  }
}


function triggerKeySpecToString(triggerSpec: TriggerSpec|null): string {
  if (!triggerSpec) {
    return 'Disabled';
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

  keys.push(triggerTypeToString(triggerSpec.type));
  return keys.join(' ');
}

function triggerTypeToString(triggerType: TriggerType): string {
  if (triggerType === TriggerType.CLICK) {
    return '(click)';
  }

  return triggerType;
}

export const HELP_TABLE = registerCustomElement({
  ctrl: HelpTable,
  deps: [KEYBOARD],
  spec: $helpTable,
  tag: 'pb-help-table',
  template,
});