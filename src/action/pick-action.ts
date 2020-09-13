import { cache } from 'gs-tools/export/data';
import { integerParser } from 'persona';
import { NEVER, Observable } from 'rxjs';

import { ActionContext, BaseAction } from '../core/base-action';

import { IsContainer } from './payload/is-container';


interface Config {
  readonly location: number;
}

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<IsContainer, Config> {
  /**
   * @internal
   */
  constructor(
      context: ActionContext<IsContainer>,
      defaultConfig: Config,
  ) {
    super(
        'pick',
        'Pick',
        {location: integerParser()},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    return NEVER;
    // const activeState$ = $stateService.get(this.context.personaContext.vine).pipe(
    //     switchMap(service => service.getState<ActivePayload>(ACTIVE_ID)),
    // );

    // return this.onTrigger$
    //     .pipe(
    //         withLatestFrom(this.context.state$, activeState$, this.config$),
    //         switchMap(([, fromState, activeState, config]) => {
    //           if (!activeState) {
    //             return EMPTY;
    //           }

    //           return moveObject(
    //               fromState,
    //               activeState,
    //               config.location,
    //               -1,
    //           );
    //         }),
    //     );
  }
}
