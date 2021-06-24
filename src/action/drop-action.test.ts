import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {$$activeSpec} from '../core/active-spec';
import {TriggerEvent} from '../core/trigger-event';
import {IsContainer} from '../payload/is-container';

import {dropAction, dropActionConfigSpecs} from './drop-action';
import {compileConfig} from './util/compile-config';


test('@protoboard2/action/drop-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const context = createFakeContext({
      shadowRoot,
      overrides: [

        {override: $stateService, withValue: stateService},
      ],
    });

    const objectId$ = new ReplaySubject<StateId<IsContainer>>(1);
    const action = dropAction({
      config$: compileConfig(host(dropActionConfigSpecs({}))._, context),
      objectId$,
      context,
    });

    const onTrigger$ = new Subject<TriggerEvent>();
    run(onTrigger$.pipe(action));

    return {action, el, objectId$, onTrigger$, personaContext: context, stateService};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1 = _.stateService.modify(x => x.add({}));
      const otherSpec2 = _.stateService.modify(x => x.add({}));

      const otherActiveSpec = _.stateService.modify(x => x.add({}));
      const movedSpec = _.stateService.modify(x => x.add({}));

      const $activeContentId$ = _.stateService
          .resolve($$activeSpec.get(_.personaContext.vine))
          ._('$contentSpecs');
      run($activeContentId$.pipe(
          tap(id => {
            if (!id) {
              return;
            }
            _.stateService.modify(x => x.set(id, [otherActiveSpec, movedSpec]));
          }),
      ));

      _.stateService.modify(x => x.set($$activeSpec.get(_.personaContext.vine), {
        containerType: 'indexed',
        $contentSpecs: x.add([otherActiveSpec, movedSpec]),
      }));

      const $targetContentIds = _.stateService.modify(x => x.add([otherSpec1, otherSpec2]));
      const $objectSpec = _.stateService.modify(x => x.add(
          {containerType: 'indexed' as const, $contentSpecs: $targetContentIds},
      ));

      _.objectId$.next($objectSpec);

      const activeIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
          _.stateService.resolve($$activeSpec.get(_.personaContext.vine)).$('$contentSpecs'),
      );
      const targetIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
          $stateService.get(_.personaContext.vine).resolve($targetContentIds));

      _.onTrigger$.next({mouseX: 0, mouseY: 0});

      assert(activeIds$).to.emitSequence([
        arrayThat<StateId<unknown>>().haveExactElements([otherActiveSpec, movedSpec]),
        arrayThat<StateId<unknown>>().haveExactElements([otherActiveSpec]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<StateId<unknown>>().haveExactElements([otherSpec1, otherSpec2]),
        arrayThat<StateId<unknown>>().haveExactElements([movedSpec, otherSpec1, otherSpec2]),
      ]);
    });
  });
});
