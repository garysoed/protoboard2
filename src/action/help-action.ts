import { Vine } from '@grapevine';
import { Observable, throwError } from '@rxjs';
import { take, tap } from '@rxjs/operators';

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

  protected onTrigger(vine: Vine, root: ShadowRoot): Observable<unknown> {
    const host = root.host;
    if (!host) {
      return throwError('Shadow root has no host');
    }

    return $helpService.get(vine)
        .pipe(
            take(1),
            tap(helpService => helpService.show(this.actions)),
        );
  }
}
