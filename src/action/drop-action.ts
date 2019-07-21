import { Vine } from '@grapevine';
import { scanArray } from '@gs-tools/rxjs';
import { Observable } from '@rxjs';
import { map, switchMap, tap, withLatestFrom } from '@rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';

import { $pickService } from './pick-service';

export class DropAction extends BaseAction {
  constructor(private readonly parentNode$: Observable<Node>) {
    super({type: TriggerType.CLICK});
  }

  protected onTrigger(vine: Vine): Observable<unknown> {
    const components$ = $pickService.get(vine).pipe(
        switchMap(pickService => {
          return pickService.getComponents()
              .pipe(
                  scanArray(),
                  map(components => ({components, pickService})),
              );
        }),
    );

    return this.parentNode$
        .pipe(
            withLatestFrom(components$),
            tap(([parentNode, {components, pickService}]) => {
              const nextComponent = components[components.length - 1] || null;
              if (!nextComponent) {
                return null;
              }

              pickService.deleteAt(components.length - 1);

              parentNode.appendChild(nextComponent);
              return nextComponent;
            }),
        );
  }
}
