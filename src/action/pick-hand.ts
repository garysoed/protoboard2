import { assertUnreachable } from '@gs-tools/typescript';
import { InstanceofType } from '@gs-types';
import { _p } from '@mask';
import { CustomElementCtrl, element, InitFn } from '@persona';
import { switchMap, tap, withLatestFrom } from '@rxjs/operators';
import template from './pick-hand.html';
import { $pickService } from './pick-service';

export const $ = {
  container: element('container', InstanceofType(HTMLDivElement), {}),
};

@_p.customElement({
  tag: 'pb-pick-hand',
  template,
})
export class PickHand extends CustomElementCtrl {
  private readonly container$ = _p.input($.container, this);

  getInitFunctions(): InitFn[] {
    return [this.renderContentElements()];
  }

  private renderContentElements(): InitFn {
    return vine => {
      return $pickService.get(vine)
          .pipe(
              switchMap(service => service.getElements()),
              withLatestFrom(this.container$),
              tap(([diff, container]) => {
                switch (diff.type) {
                  case 'add':
                    container.appendChild(diff.value);
                    break;
                  case 'delete':
                    container.removeChild(diff.value);
                    break;
                  case 'init':
                    while (container.childElementCount > 0) {
                      const toDelete = container.firstElementChild;
                      if (!toDelete) {
                        break;
                      }
                      container.removeChild(toDelete);
                    }

                    for (const el of diff.value) {
                      container.appendChild(el);
                    }
                    break;
                  default:
                    assertUnreachable(diff);
                }
              }),
          );
    };
  }
}
