import { assert, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { host, style } from 'persona';
import { createFakeContext } from 'persona/export/testing';
import { ReplaySubject } from 'rxjs';

import { IsRotatable } from '../action/payload/is-rotatable';

import { renderRotatable } from './render-rotatable';

test('@protoboard2/render/render-rotatable', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    const $ = host({transform: style('transform')});
    const isRotatable$ = new ReplaySubject<IsRotatable|null>(1);

    const stateService = new StateService();
    $stateService.set(context.vine, () => stateService);

    run(renderRotatable(isRotatable$, $._.transform, context));

    return {el, isRotatable$, stateService};
  });

  should(`output the correct transform style`, () => {
    const rotationDeg = 123;
    const $rotationDeg = _.stateService.add<number>(rotationDeg);
    _.isRotatable$.next({$rotationDeg});

    assert(_.el.style.transform).to.equal(`rotateZ(${rotationDeg}deg)`);
  });

  should(`output 0 if IsRotatable payload is null`, () => {
    _.isRotatable$.next(null);

    assert(_.el.style.transform).to.equal(`rotateZ(0deg)`);
  });
});
