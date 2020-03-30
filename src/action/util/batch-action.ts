import { Vine } from 'grapevine';
import { $asSet, $filter, $pipe, arrayFrom } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { mutationObservable } from 'persona';
import { Observable } from 'rxjs';
import { map, mapTo, startWith, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../../core/base-action';


/**
 * Applies the action to all of the host's children elements by calling their functions.
 */
export class BatchAction extends BaseAction {
  @cache()
  private get children$(): Observable<ReadonlySet<HTMLElement>> {
    return this.host$.pipe(
        switchMap(host => {
          return mutationObservable(host, {childList: true}).pipe(startWith({}), mapTo(host));
        }),
        map(host => {
          return $pipe(
              arrayFrom(host.children),
              $filter((item): item is HTMLElement => item instanceof HTMLElement),
              $asSet(),
          );
        }),
    );
  }

  constructor(
      actionKey: string,
      actionDesc: string,
      vine: Vine,
  ) {
    super(actionKey, actionDesc, {}, vine);

    this.setupHandleTrigger();
  }

  private setupHandleTrigger(): void {
    this.onTrigger$
        .pipe(
            withLatestFrom(this.children$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, children]) => {
          for (const child of children) {
            const fn = (child as any)[this.key];
            if (!(fn instanceof Function)) {
              continue;
            }

            fn();
          }
        });
  }
}
