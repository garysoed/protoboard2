import {$asArray, $map, $pipe, $zip, countableIterable} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {renderTheme} from 'mask';
import {Context, Ctrl, DIV, id, ievent, oclass, omulti, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import template from './help-overlay.html';
import {$helpService} from './help-service';
import {HELP_TABLE} from './help-table';


export const $helpOverlay = {
  shadow: {
    root: id('root', DIV, {
      click: ievent('click', Event),
      isVisibleClass: oclass('isVisible'),
      tables: omulti('#tables'),
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
      this.tables$.pipe(this.$.shadow.root.tables()),
      this.$.shadow.root.click.pipe(tap(() => $helpService.get(this.$.vine).hide())),
    ];
  }

  private get isVisible$(): Observable<boolean> {
    return $helpService.get(this.$.vine).contents$.pipe(
        map(actions => actions.length > 0),
    );
  }

  @cache()
  private get tables$(): Observable<readonly RenderSpec[]> {
    return $helpService.get(this.$.vine).contents$.pipe(
        map(contents => $pipe(
            contents,
            $zip(countableIterable()),
            $map(([, index]) => renderCustomElement({
              registration: HELP_TABLE,
              inputs: {index: `${index}`},
              id: index,
            })),
            $asArray(),
        )),
    );
  }
}

export const HELP_OVERLAY = registerCustomElement({
  ctrl: HelpOverlay,
  deps: [HELP_TABLE],
  spec: $helpOverlay,
  tag: 'pb-help-overlay',
  template,
});
