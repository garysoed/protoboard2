import {Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {EMPTY, fromEvent, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {fakeTriggerEvent} from '../core/testing/fake-trigger-event';
import {TriggerEvent} from '../core/trigger-event';
import {TriggerType} from '../core/trigger-spec';

import {helpAction} from './help-action';
import {ActionTrigger, HelpContent, ShowHelpEvent, SHOW_HELP_EVENT} from './help-service';


test('@protoboard2/action/help-action', init => {
  const TRIGGER = {type: TriggerType.T};
  const TAG = 'tag';

  const _ = init(() => {
    const vine = new Vine({appName: 'test'});
    const targetEl = document.createElement('div');
    const action = helpAction({
      config$: of({
        helpContent: {
          tag: TAG,
          actions: [
            {trigger: TRIGGER, actionName: 'test'},
          ],
        },
        targetEl,
        trigger: {type: TriggerType.CLICK},
      }),
      vine,
      objectPath$: EMPTY,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, onTrigger$, targetEl};
  });

  test('onTrigger', () => {
    should('dispatch the pb-show-help event', () => {
      const content$ = createSpySubject(fromEvent<ShowHelpEvent>(_.targetEl, SHOW_HELP_EVENT).pipe(
          map(event => event.contents),
      ));

      _.onTrigger$.next(fakeTriggerEvent({}));

      assert(content$).to.emitSequence([
        arrayThat<HelpContent>().haveExactElements([
          objectThat<HelpContent>().haveProperties({
            tag: TAG,
            actions: arrayThat<ActionTrigger>().haveExactElements([
              objectThat<ActionTrigger>().haveProperties({
                actionName: 'test',
                trigger: TRIGGER,
              }),
            ]),
          }),
        ]),
      ]);
    });

    should('add the details if there is a pb-show-help event from a child element', () => {
      const childEl = document.createElement('div');
      _.targetEl.appendChild(childEl);

      const content$ = createSpySubject(fromEvent<ShowHelpEvent>(_.targetEl, SHOW_HELP_EVENT).pipe(
          map(event => event.contents),
      ));

      childEl.dispatchEvent(new ShowHelpEvent());

      assert(content$).to.emitSequence([
        arrayThat<HelpContent>().haveExactElements([
          objectThat<HelpContent>().haveProperties({
            tag: TAG,
            actions: arrayThat<ActionTrigger>().haveExactElements([
              objectThat<ActionTrigger>().haveProperties({
                actionName: 'test',
                trigger: TRIGGER,
              }),
            ]),
          }),
        ]),
      ]);
    });
  });
});
