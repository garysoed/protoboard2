import {cache} from 'gs-tools/export/data';
import {NEVER, Observable} from 'rxjs';

import {ActionContext, BaseAction} from '../core/base-action';
import {ContainerSpec} from '../types/container-spec';


export class ShuffleAction extends BaseAction<ContainerSpec<unknown, 'indexed'>> {
  constructor(context: ActionContext<ContainerSpec<unknown, 'indexed'>, {}>) {
    super(
        'shuffle',
        'Shuffle',
        {},
        context,
        {},
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    return NEVER;
    // const contentIds$ = this.context.state$.pipe(
    //     switchMap(state => state.payload.contentIds),
    // );
    // return this.onTrigger$
    //     .pipe(
    //         withLatestFrom(
    //             this.context.state$,
    //             contentIds$,
    //             $random.get(this.vine),
    //         ),
    //         tap(([, state, contentIds, rng]) => {
    //           state.payload.contentIds.next(shuffle(contentIds, rng));
    //         }),
    //     );
  }
}
