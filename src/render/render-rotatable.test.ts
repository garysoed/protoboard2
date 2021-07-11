import {$stateService} from 'grapevine';
import {assert, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState} from 'gs-tools/export/state';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject, of} from 'rxjs';

import {IsRotatable} from '../payload/is-rotatable';

import {renderRotatable} from './render-rotatable';


test('@protoboard2/render/render-rotatable', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const context = createFakeContext({
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
      shadowRoot,
    });

    const isRotatable = stateService.addRoot<IsRotatable>({
      rotationDeg: mutableState(0),
    });

    const slottedNodes$ = new ReplaySubject<readonly Node[]>(1);
    run(renderRotatable(stateService._(isRotatable), slottedNodes$, context));

    return {isRotatable, slottedNodes$, stateService};
  });

  should('output the correct transform style', () => {
    const rotationDeg = 123;
    run(of(rotationDeg).pipe(_.stateService._(_.isRotatable).$('rotationDeg').set()));

    const targetEl = document.createElement('div');
    _.slottedNodes$.next([targetEl]);

    assert(targetEl.style.transform).to.equal(`rotateZ(${rotationDeg}deg)`);
  });
});
