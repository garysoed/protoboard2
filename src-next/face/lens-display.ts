import {cache} from 'gs-tools/export/data';
import {unknownType} from 'gs-types';
import {renderTheme, THEME_LOADER_TYPE} from 'mask';
import {Context, Ctrl, ocase, registerCustomElement, root} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {$getLensRenderSpec$} from '../renderspec/render-lens-spec';

import {$lensService} from './lens-service';


export const $lensDisplay = {
  shadow: {
    root: root({
      content: ocase('#content', unknownType),
      theme: ocase('#theme', THEME_LOADER_TYPE),
    }),
  },
};

export class LensDisplay implements Ctrl {
  constructor(private readonly $: Context<typeof $lensDisplay>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$, this.$.shadow.root.theme),
      $lensService.get(this.$.vine).faceId$.pipe(
          this.$.shadow.root.content(contentId => {
            if (!contentId) {
              return of(null);
            }

            return $getLensRenderSpec$.get(this.$.vine).pipe(
                map(getLensRenderSpec => getLensRenderSpec(contentId)),
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