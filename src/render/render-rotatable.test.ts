import {assert, run, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {createFakeContext} from 'persona/export/testing';
import {ReplaySubject} from 'rxjs';

import {IsRotatable} from '../payload/is-rotatable';

import {renderRotatable} from './render-rotatable';


test('@protoboard2/render/render-rotatable', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    const isRotatable$ = new ReplaySubject<IsRotatable|null>(1);

    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);

    const slottedNodes$ = new ReplaySubject<readonly Node[]>(1);
    run(renderRotatable(isRotatable$, slottedNodes$, context));

    return {isRotatable$, slottedNodes$, stateService};
  });

  should('output the correct transform style', () => {
    const rotationDeg = 123;
    const $rotationDeg = _.stateService.add<number>(rotationDeg);
    _.isRotatable$.next({$rotationDeg});

    const targetEl = document.createElement('div');
    _.slottedNodes$.next([targetEl]);

    assert(targetEl.style.transform).to.equal(`rotateZ(${rotationDeg}deg)`);
  });

  should('output 0 if IsRotatable payload is null', () => {
    const targetEl = document.createElement('div');
    _.slottedNodes$.next([targetEl]);
    _.isRotatable$.next(null);

    assert(targetEl.style.transform).to.equal('rotateZ(0deg)');
  });
});
