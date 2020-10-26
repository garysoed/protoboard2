import { cache } from 'gs-tools/export/data';
import { shuffle } from 'gs-tools/export/random';
import { NEVER, Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { IsContainer } from '../payload/is-container';

import { $random } from './util/random';


export class ShuffleAction extends BaseAction<IsContainer<'indexed'>> {
  constructor(context: ActionContext<IsContainer<'indexed'>>) {
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
    //             $random.get(this.context.personaContext.vine),
    //         ),
    //         tap(([, state, contentIds, rng]) => {
    //           state.payload.contentIds.next(shuffle(contentIds, rng));
    //         }),
    //     );
  }
}
