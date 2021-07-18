import {$asArray, $map, $pipe, $zip, countableIterable} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {BaseThemedCtrl, _p} from 'mask';
import {$div, classToggle, element, multi, onDom, PersonaContext, renderCustomElement, RenderSpec} from 'persona';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import template from './help-overlay.html';
import {$helpService} from './help-service';
import {$helpTable, HelpTable} from './help-table';


export const $helpOverlay = {
  tag: 'pb-help-overlay',
  api: {},
};

export const $ = {
  root: element('root', $div, {
    click: onDom('click'),
    isVisibleClass: classToggle('isVisible'),
    tables: multi('#tables'),
  }),
};

@_p.customElement({
  ...$helpOverlay,
  template,
  dependencies: [HelpTable],
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
      this.renderers.root.tables(this.tables$),
    ];
  }

  private get isVisible$(): Observable<boolean> {
    return $helpService.get(this.vine).contents$.pipe(
        map(actions => actions.length > 0),
    );
  }

  private setupHandleClick(): Observable<unknown> {
    return this.inputs.root.click
        .pipe(tap(() => $helpService.get(this.vine).hide()));
  }

  @cache()
  private get tables$(): Observable<readonly RenderSpec[]> {
    return $helpService.get(this.vine).contents$.pipe(
        map(contents => $pipe(
            contents,
            $zip(countableIterable()),
            $map(([, index]) => renderCustomElement({
              spec: $helpTable,
              inputs: {index},
              id: index,
            })),
            $asArray(),
        )),
    );
  }
}
