import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {$$activeSpec} from '../core/active-spec';
import {TriggerType} from '../core/trigger-spec';
import {ContentSpec, IsContainer} from '../payload/is-container';

import {dropAction, dropActionConfigSpecs} from './drop-action';
import {createFakeActionContext} from './testing/fake-action-context';
import {triggerKey} from './testing/trigger-key';
import {compileConfig} from './util/compile-config';


test('@protoboard2/action/drop-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const objectId$ = new ReplaySubject<StateId<IsContainer<'indexed'>>|null>(1);
    const context = createFakeActionContext<IsContainer<'indexed'>>({
      objectId$,
      personaContext,
    });

    const action = dropAction(
        compileConfig(host(dropActionConfigSpecs({}))._, personaContext),
    ).action;

    return {action, context, el, objectId$, personaContext, stateService};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const otherSpec1 = {
        objectId: _.stateService.modify(x => x.add({})),
        coordinate: createIndexed(0),
      };
      const otherSpec2 = {
        objectId: _.stateService.modify(x => x.add({})),
        coordinate: createIndexed(1),
      };

      const otherActiveSpec = {
        objectId: _.stateService.modify(x => x.add({})),
        coordinate: createIndexed(0),
      };
      const movedSpec = {
        objectId: _.stateService.modify(x => x.add({})),
        coordinate: createIndexed(1),
      };

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

      const activeIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          _.stateService.resolve($$activeSpec.get(_.personaContext.vine)).$('$contentSpecs'),
      );
      const targetIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          $stateService.get(_.personaContext.vine).resolve($targetContentIds));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.D});

      assert(activeIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherActiveSpec, movedSpec]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherActiveSpec]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherSpec1, otherSpec2]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([
          otherSpec1,
          otherSpec2,
          objectThat<ContentSpec<'indexed'>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(0)),
          }),
        ]),
      ]);
    });
  });
});
