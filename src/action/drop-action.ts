import { Vine } from 'grapevine';
import { scanArray } from 'gs-tools/export/rxjs';
import { Observable } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';

import { $pickService } from './pick-service';

export class DropAction extends BaseAction {
  constructor(private readonly parentNode$: Observable<Node>) {
    super(
        'Drop',
        'drop',
        {},
        {type: TriggerType.CLICK},
    );
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(trigger$: Observable<unknown>, vine: Vine): Observable<unknown> {
    const components$ = $pickService.get(vine).pipe(
        switchMap(pickService => {
          return pickService.getComponents()
              .pipe(
                  scanArray(),
                  map(components => ({components, pickService})),
              );
        }),
    );

    return trigger$
        .pipe(
            withLatestFrom(this.parentNode$, components$),
            tap(([, parentNode, {components, pickService}]) => {
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
