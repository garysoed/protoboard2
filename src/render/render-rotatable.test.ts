import {$stateService} from 'grapevine';
import {assert, run, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';

import {fakePieceSpec} from '../objects/testing/fake-object-spec';
import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';

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
    const isRotatable$ = new ReplaySubject<PieceSpec<IsRotatable>|undefined>(1);

    const slottedNodes$ = new ReplaySubject<readonly Node[]>(1);
    run(renderRotatable(isRotatable$, slottedNodes$, context));

    return {isRotatable$, slottedNodes$, stateService};
  });

  should('output the correct transform style', () => {
    const rotationDeg = 123;
    const $rotationDeg = _.stateService.modify(x => x.add(rotationDeg));
    _.isRotatable$.next(fakePieceSpec({payload: {$rotationDeg}}));

    const targetEl = document.createElement('div');
    _.slottedNodes$.next([targetEl]);

    assert(targetEl.style.transform).to.equal(`rotateZ(${rotationDeg}deg)`);
  });

  should('output 0 if IsRotatable payload is null', () => {
    const targetEl = document.createElement('div');
    _.slottedNodes$.next([targetEl]);
    _.isRotatable$.next(undefined);

    assert(targetEl.style.transform).to.equal('rotateZ(0deg)');
  });
});
