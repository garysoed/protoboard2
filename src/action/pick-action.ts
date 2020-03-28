import { Vine } from 'grapevine';
import { element } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';

import { $pickService } from './pick-service';

export class PickAction extends BaseAction {
  constructor() {
    super(
        'pick',
        'Pick',
        {},
        {type: TriggerType.CLICK},
    );
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(
      trigger$: Observable<unknown>,
      vine: Vine,
      root: ShadowRoot,
  ): Observable<unknown> {
    return trigger$.pipe(
        withLatestFrom(element({}).getValue(root), $pickService.get(vine)),
        tap(([, el, pickService]) => pickService.add(el)),
    );
  }
}
