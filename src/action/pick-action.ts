import { Vine } from 'grapevine';
import { host } from 'persona';
import { Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

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

    this.addSetup(this.setupHandleTrigger());
  }

  protected onConfig(config$: Observable<Partial<{}>>): Observable<unknown> {
    return config$;
  }

  protected setupHandleTrigger(): Observable<unknown> {
    const host$ = this.actionContext$
        .pipe(switchMap(shadowRoot => host({}).getValue(shadowRoot)));
    return this.onTrigger$
        .pipe(
            withLatestFrom(host$, $pickService.get(this.vine)),
            tap(([, el, pickService]) => {
              pickService.add(el);
            }),
        );
  }
}
