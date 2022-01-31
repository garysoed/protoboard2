import {cache} from 'gs-tools/export/data';
import {renderTheme} from 'mask';
import {Context, Ctrl, osingle, registerCustomElement, RenderSpec, root} from 'persona';
import {Observable} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {$getLensRenderSpec$} from '../renderspec/render-lens-spec';

import {$lensService} from './lens-service';


export const $lensDisplay = {
  shadow: {
    root: root({
      content: osingle(),
    }),
  },
};

export class LensDisplay implements Ctrl {
  constructor(private readonly $: Context<typeof $lensDisplay>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.contentSpec$.pipe(this.$.shadow.root.content()),
    ];
  }

  private get contentSpec$(): Observable<RenderSpec|null> {
    return $lensService.get(this.$.vine).faceId$.pipe(
        withLatestFrom($getLensRenderSpec$.get(this.$.vine)),
        map(([faceId, getLensRenderSpec]) => {
          if (!faceId) {
            return null;
          }

          return getLensRenderSpec(faceId);
        }),
    );
  }
}

export const LENS_DISPLAY = registerCustomElement({
  ctrl: LensDisplay,
  spec: $lensDisplay,
  tag: 'pb-lens-display',
  template: '',
});