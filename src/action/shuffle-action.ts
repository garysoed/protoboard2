import { shuffle } from 'gs-tools/export/random';
import { Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';

import { DroppablePayload } from './payload/droppable-payload';
import { $random } from './util/random';


export class ShuffleAction extends BaseAction<DroppablePayload> {
  constructor(context: ActionContext<DroppablePayload>) {
    super(
        'shuffle',
        'Shuffle',
        {},
        context,
    );

    this.addSetup(this.setupHandleTrigger());
  }

  private setupHandleTrigger(): Observable<unknown> {
    const contentIds$ = this.context.state$.pipe(
        switchMap(state => state.payload.contentIds),
    );
    return this.onTrigger$
        .pipe(
            withLatestFrom(
                this.context.state$,
                contentIds$,
                $random.get(this.context.personaContext.vine),
            ),
            tap(([, state, contentIds, rng]) => {
              state.payload.contentIds.next(shuffle(contentIds, rng));
            }),
        );
  }
}
