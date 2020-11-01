import { ActionContext, BaseAction } from '../core/base-action';
import { IsContainer } from '../payload/is-container';
import { NEVER, Observable } from 'rxjs';
import { cache } from 'gs-tools/export/data';


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
