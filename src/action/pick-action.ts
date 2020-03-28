import { Vine } from 'grapevine';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerType } from '../core/trigger-spec';

import { $pickService } from './pick-service';

export class PickAction extends BaseAction {
  constructor(context: PersonaContext) {
    super(
        'pick',
        'Pick',
        {},
        {type: TriggerType.CLICK},
        context,
    );

    this.setupHandleTrigger();
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(): void {
    this.onTrigger$
        .pipe(
            withLatestFrom(element({}).getValue(this.shadowRoot), $pickService.get(this.vine)),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, el, pickService]) => {
          pickService.add(el);
        });
  }
}
