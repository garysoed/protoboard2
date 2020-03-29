import { Vine } from 'grapevine';
import { element } from 'persona';
import { Observable } from 'rxjs';
import { switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';

import { $pickService } from './pick-service';


export class PickAction extends BaseAction {
  constructor(vine: Vine) {
    super(
        'pick',
        'Pick',
        {},
        vine,
    );

    this.setupHandleTrigger();
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(): void {
    const host$ = this.actionTarget$
        .pipe(switchMap(shadowRoot => element({}).getValue(shadowRoot)));
    this.onTrigger$
        .pipe(
            withLatestFrom(host$, $pickService.get(this.vine)),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, el, pickService]) => {
          pickService.add(el);
        });
  }
}
