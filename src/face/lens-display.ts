import {cache} from 'gs-tools/export/data';
import {renderTheme, ThemeLoader} from 'mask';
import {Context, Ctrl, ocase, registerCustomElement, RenderSpec, root} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


import {$lensService} from './lens-service';

export const $lensDisplay = {
  shadow: {
    root: root({
      content: ocase<RenderSpec|null>('#content'),
      theme: ocase<ThemeLoader>('#theme'),
    }),
  },
};

export class LensDisplay implements Ctrl {
  constructor(private readonly $: Context<typeof $lensDisplay>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$, this.$.shadow.root.theme),
      $lensService.get(this.$.vine).faceSpec$.pipe(
          this.$.shadow.root.content(map(renderSpec => renderSpec)),
      ),
    ];
  }
}

export const LENS_DISPLAY = registerCustomElement({
  ctrl: LensDisplay,
  spec: $lensDisplay,
  tag: 'pb-lens-display',
  template: '<!-- #content --><!-- #theme -->',
});