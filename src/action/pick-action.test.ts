import {$stateService} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {createFakeContext} from 'persona/export/testing';
import {of, ReplaySubject} from 'rxjs';

import {createIndexed, Indexed} from '../coordinate/indexed';
import {activeSpec} from '../core/active';
import {$$activeSpec} from '../core/active-spec';
import {TriggerType} from '../core/trigger-spec';
import {$setParent} from '../objects/content-map';
import {ContentSpec} from '../payload/is-container';

import {Config, pickAction} from './pick-action';
import {createFakeActionContext} from './testing/fake-action-context';


test('@protoboard2/action/pick-action', init => {
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

    const objectId$ = new ReplaySubject<StateId<{}>|null>(1);
    const context = createFakeActionContext<{}, Config>({
      objectId$,
      vine: personaContext.vine,
    });
    const action = pickAction({trigger: TriggerType.P}).action;

    return {action, context, el, objectId$, personaContext, stateService};
  });

  test('onTrigger', () => {
    should('trigger correctly', () => {
      const movedId = _.stateService.modify(x => x.add({}));
      const otherSpec1 = {
        objectId: _.stateService.modify(x => x.add({})),
        coordinate: createIndexed(11),
      };
      const movedSpec = {
        objectId: movedId,
        coordinate: createIndexed(1),
      };
      const otherSpec2 = {
        objectId: _.stateService.modify(x => x.add({})),
        coordinate: createIndexed(12),
      };

      const otherActiveSpec = {
        objectId: _.stateService.modify(x => x.add({})),
        coordinate: createIndexed(10),
      };

      const $activeContentIds = _.stateService.modify(x => x.add([otherActiveSpec]));
      const $targetContentSpecs = _.stateService.modify(x => x.add([otherSpec1, movedSpec, otherSpec2]));
      const $container = _.stateService.modify(x => x.add({
        containerType: 'indexed' as const,
        $contentSpecs: $targetContentSpecs,
      }));

      _.stateService.modify(x => x.set(
          $$activeSpec.get(_.personaContext.vine),
          activeSpec({
            $contentSpecs: $activeContentIds,
          })));

      const setParent = $setParent.get(_.personaContext.vine);
      setParent(otherActiveSpec.objectId, $$activeSpec.get(_.personaContext.vine));
      setParent(otherSpec1.objectId, $container);
      setParent(movedSpec.objectId, $container);
      setParent(otherSpec2.objectId, $container);

      _.objectId$.next(movedId);

      const activeIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          $stateService.get(_.personaContext.vine).resolve($activeContentIds));
      const targetIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
          $stateService.get(_.personaContext.vine).resolve($targetContentSpecs));

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action(_.context)));

      assert(activeIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherActiveSpec]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([
          otherActiveSpec,
          objectThat<ContentSpec<'indexed'>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(11)),
          }),
        ]),
      ]);
      assert(targetIds$).to.emitSequence([
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherSpec1, movedSpec, otherSpec2]),
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([otherSpec1, otherSpec2]),
      ]);
    });
  });
});
