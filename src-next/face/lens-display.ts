import {cache} from 'gs-tools/export/data';
import {renderTheme, ThemeLoader} from 'mask';
import {Context, Ctrl, ocase, registerCustomElement, RenderSpec, root} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {FaceId} from '../id/face-id';
import {$getLensRenderSpec$} from '../renderspec/render-lens-spec';

import {$lensService} from './lens-service';

type GetLensRenderSpecFn = (faceId: FaceId<unknown>) => RenderSpec|null;

export const $lensDisplay = {
  shadow: {
    root: root({
      content: ocase<[FaceId<unknown>|null, GetLensRenderSpecFn]>('#content', ([faceId]) => faceId),
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
              this.$.shadow.root.content(map(([faceId, getLensRenderSpec]) => {
                if (!faceId) {
                  return null;
                }

                return getLensRenderSpec(faceId);
              })),
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