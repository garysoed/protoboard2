import {cache} from 'gs-tools/export/data';
import {unknownType} from 'gs-types';
import {Context, Ctrl, ievent, ivalue, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {faceIdType} from '../id/face-id';

import {$lensService} from './lens-service';
import template from './lens.html';


const $lens = {
  host: {
    faceId: ivalue('faceId', faceIdType(unknownType)),
    onMouseEnter: ievent('mouseenter', Event),
    onMouseLeave: ievent('mouseleave', Event),
  },
  api: { },
};

class Lens implements Ctrl {
  private readonly lensService = $lensService.get(this.$.vine);

  constructor(private readonly $: Context<typeof $lens>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.handleMouseEnter$,
      this.handleMouseLeave$,
    ];
  }

  @cache()
  private get handleMouseLeave$(): Observable<unknown> {
    return this.$.host.onMouseLeave.pipe(
        tap(() => {
          this.lensService.hide();
        }),
    );
  }

  @cache()
  private get handleMouseEnter$(): Observable<unknown> {
    return this.$.host.onMouseEnter.pipe(
        withLatestFrom(this.$.host.faceId),
        tap(([, faceId]) => {
          if (faceId === undefined) {
            return;
          }

          this.lensService.show(faceId);
        }),
    );
  }
}

export const LENS = registerCustomElement({
  ctrl: Lens,
  spec: $lens,
  tag: 'pb-lens',
  template,
});