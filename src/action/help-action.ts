import { Vine } from '@grapevine';
import { Observable } from '@rxjs';
import { tap, withLatestFrom } from '@rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerKey, TriggerType } from '../core/trigger-spec';

import { $helpService } from './help-service';

export class HelpAction extends BaseAction {
  constructor(private readonly actions: Iterable<BaseAction>) {
    super(
        'help',
        'Help',
        {},
        {type: TriggerType.KEY, key: TriggerKey.QUESTION},
    );
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected onTrigger(
      trigger$: Observable<unknown>,
      vine: Vine,
  ): Observable<unknown> {
    return trigger$
        .pipe(
            withLatestFrom($helpService.get(vine)),
            tap(([, helpService]) => helpService.show(this.actions)),
        );
  }
}
