import {cache} from 'gs-tools/export/data';
import {renderTheme, ThemeLoader} from 'mask';
import {Context, Ctrl, ocase, registerCustomElement, root} from 'persona';
import {combineLatest, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {$getLensRenderSpec$} from '../renderspec/render-lens-spec';

import {$lensService} from './lens-service';


export const $lensDisplay = {
  shadow: {
    root: root({
      content: ocase<unknown>('#content'),
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
      combineLatest([
        $lensService.get(this.$.vine).faceId$,
        $getLensRenderSpec$.get(this.$.vine),
      ])
          .pipe(
              switchMap(([faceId, getLensRenderSpec]) => {
                return of(faceId).pipe(
                    this.$.shadow.root.content(faceId => {
                      if (!faceId) {
                        return null;
                      }

                      return getLensRenderSpec(faceId);
                    }),
                );
              }),
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