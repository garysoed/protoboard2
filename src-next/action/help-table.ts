import {$asArray, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {KEYBOARD, renderTheme, SpecialKeys} from 'mask';
import {Context, Ctrl, H3, iattr, id, omulti, otext, registerCustomElement, renderCustomElement, renderElement, RenderSpec, TBODY} from 'persona';
import {combineLatest, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {TriggerSpec, TriggerType} from '../types/trigger-spec';

import {$helpService} from './help-service';
import template from './help-table.html';
import {HelpContent} from './show-help-event';


const $helpTable = {
  host: {
    index: iattr('index'),
  },
  shadow: {
    title: id('title', H3, {
      text: otext(),
    }),
    content: id('content', TBODY, {
      rows: omulti('#rows'),
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
      this.rows$.pipe(this.$.shadow.content.rows()),
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

  @cache()
  private get rows$(): Observable<readonly RenderSpec[]> {
    return this.content$
        .pipe(
            map(content => {
              if (!content) {
                return [];
              }

              const rows$list = $pipe(
                  content.actions,
                  $map(({actionName, trigger}) => {
                    const keyboardEl$ = renderCustomElement({
                      registration: KEYBOARD,
                      attrs: new Map([['a', of('test')]]),
                      inputs: {text: of(triggerKeySpecToString(trigger))},
                      id: {},
                    });
                    const triggerEl$ = renderElement({
                      tag: 'td',
                      children: [keyboardEl$],
                      id: {},
                    });

                    const actionEl$ = renderElement({
                      tag: 'td',
                      textContent: actionName,
                      id: {},
                    });
                    return renderElement({
                      tag: 'tr',
                      children: [triggerEl$, actionEl$],
                      id: {},
                    });
                  }),
                  $asArray(),
              );

              if (rows$list.length <= 0) {
                return [];
              }

              return rows$list;
            }),
        );
  }

  @cache()
  private get title$(): Observable<string> {
    return this.content$.pipe(map(() => 'TODO'));
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