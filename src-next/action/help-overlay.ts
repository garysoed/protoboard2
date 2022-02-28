import {cache} from 'gs-tools/export/data';
import {unknownType} from 'gs-types';
import {renderTheme} from 'mask';
import {Context, Ctrl, DIV, id, ievent, oclass, oforeach, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import template from './help-overlay.html';
import {$helpService} from './help-service';
import {HELP_TABLE} from './help-table';


export const $helpOverlay = {
  shadow: {
    root: id('root', DIV, {
      click: ievent('click', Event),
      isVisibleClass: oclass('isVisible'),
      tables: oforeach('#tables', unknownType),
    }),
  },
};

export class HelpOverlay implements Ctrl {
  constructor(private readonly $: Context<typeof $helpOverlay>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.isVisible$.pipe(this.$.shadow.root.isVisibleClass()),
      $helpService.get(this.$.vine).contents$.pipe(this.$.shadow.root.tables(
          (_, index) => this.renderHelpTable(index),
      )),
      this.$.shadow.root.click.pipe(tap(() => $helpService.get(this.$.vine).hide())),
    ];
  }

  private get isVisible$(): Observable<boolean> {
    return $helpService.get(this.$.vine).contents$.pipe(
        map(actions => actions.length > 0),
    );
  }

  private renderHelpTable(index: number): Observable<RenderSpec> {
    return of(renderCustomElement({
      registration: HELP_TABLE,
      inputs: {index: of(`${index}`)},
    }));
  }
}

export const HELP_OVERLAY = registerCustomElement({
  ctrl: HelpOverlay,
  deps: [HELP_TABLE],
  spec: $helpOverlay,
  tag: 'pb-help-overlay',
  template,
});
