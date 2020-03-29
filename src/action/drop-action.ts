import { Vine } from 'grapevine';
import { scanArray } from 'gs-tools/export/rxjs';
import { Observable } from 'rxjs';
import { map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';

import { $pickService } from './pick-service';


export class DropAction extends BaseAction {
  constructor(
      private readonly parentNode$: Observable<Node>,
      vine: Vine,
  ) {
    super(
        'Drop',
        'drop',
        {},
        vine,
    );

    this.setupHandleTrigger();
  }

  private setupHandleTrigger(): void {
    const components$ = $pickService.get(this.vine).pipe(
        switchMap(pickService => {
          return pickService.getComponents()
              .pipe(
                  scanArray(),
                  map(components => ({components, pickService})),
              );
        }),
    );

    this.onTrigger$
        .pipe(
            withLatestFrom(this.parentNode$, components$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, parentNode, {components, pickService}]) => {
          const nextComponent = components[components.length - 1] || null;
          if (!nextComponent) {
            return;
          }

          pickService.deleteAt(components.length - 1);

          parentNode.appendChild(nextComponent);
        });
  }
}
