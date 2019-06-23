import { Vine } from '@grapevine';
import { scanArray } from '@gs-tools/rxjs';
import { Observable } from '@rxjs';
import { switchMap, tap, withLatestFrom } from '@rxjs/operators';
import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';
import { $pickService } from './pick-service';

export class DropAction extends BaseAction {
  constructor(private readonly parentNode$: Observable<Node>) {
    super({type: TriggerType.CLICK});
  }

  protected onTrigger(vine: Vine): Observable<unknown> {
    return this.parentNode$
        .pipe(
            withLatestFrom($pickService.get(vine)),
            switchMap(([parentNode, pickService]) => pickService.getComponents()
                .pipe(
                    scanArray(),
                    tap(components => {
                      const nextComponent = components[components.length - 1] || null;
                      pickService.deleteAt(components.length - 1);

                      parentNode.appendChild(nextComponent);
                      return nextComponent;
                    }),
                ),
            ),
        );
  }
}
