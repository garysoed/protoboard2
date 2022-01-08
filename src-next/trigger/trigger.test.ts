import {source} from 'grapevine';
import {assert, objectThat, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Context, Ctrl, DIV, id, itarget, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest, windowHarness} from 'persona/export/testing';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';

import {TriggerSpec, TriggerType} from '../types/trigger-spec';

import {onTrigger} from './trigger';
import {TriggerDetails} from './trigger-details';


const $onEvent = source(() => new ReplaySubject<TriggerDetails>());
const $onParentEvent = source(() => new ReplaySubject<TriggerDetails>());
const $triggerSpec = source(() => new BehaviorSubject<TriggerSpec>({type: TriggerType.CLICK}));

const $test = {
  shadow: {
    target: id('target', DIV, {
      target: itarget(),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.shadow.target.target.pipe(
          onTrigger($triggerSpec.get(this.$.vine)),
          forwardTo($onEvent.get(this.$.vine)),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="target"></div>',
});

const $parent = {
  shadow: {
    container: id('container', DIV, {
      target: itarget(),
    }),
  },
};

class Parent implements Ctrl {
  constructor(private readonly $: Context<typeof $parent>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.shadow.container.target.pipe(
          onTrigger($triggerSpec.get(this.$.vine)),
          forwardTo($onParentEvent.get(this.$.vine)),
      ),
    ];
  }
}

const PARENT = registerCustomElement({
  ctrl: Parent,
  deps: [TEST],
  spec: $parent,
  tag: 'pbt-parent',
  template: '<div id="container"><pbt-test id="test"></pbt-test></div>',
});

test('@protoboard2/src/trigger/trigger', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [PARENT]});
    return {tester};
  });

  test('createOnClick', () => {
    should('trigger click based actions', () => {
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.CLICK, alt: true, meta: true});

      const element = _.tester.createElement(TEST);
      const harness = getHarness(element, 'target', ElementHarness);
      const altKey = true;
      const ctrlKey = false;
      const metaKey = true;
      const shiftKey = false;
      const mouseX = 12;
      const mouseY = 34;
      harness.simulateClick(
          {
            altKey,
            ctrlKey,
            metaKey,
            clientX: mouseX,
            clientY: mouseY,
            shiftKey,
          },
      );

      assert($onEvent.get(_.tester.vine)).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({
          altKey,
          ctrlKey,
          metaKey,
          mouseX,
          mouseY,
          shiftKey,
        }),
      ]);
    });
  });

  test('createTriggerKey', () => {
    should('emit when hovered and the correct key was pressed', () => {
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T, alt: true, meta: true});

      const element = _.tester.createElement(TEST);
      const harness = getHarness(element, 'target', ElementHarness);
      const altKey = true;
      const ctrlKey = false;
      const metaKey = true;
      const shiftKey = false;
      const mouseX = 12;
      const mouseY = 34;

      harness.simulateMouseOver();
      harness.simulateMouseMove({
        clientX: mouseX,
        clientY: mouseY,
      });

      windowHarness.simulateKeydown(TriggerType.T, {
        altKey,
        ctrlKey,
        metaKey,
        shiftKey,
      });

      assert($onEvent.get(_.tester.vine)).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({
          altKey,
          ctrlKey,
          metaKey,
          mouseX,
          mouseY,
          shiftKey,
        }),
      ]);
    });

    should('not emit when the wrong key was pressed', () => {
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T});

      const element = _.tester.createElement(TEST);
      const harness = getHarness(element, 'target', ElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      harness.simulateMouseOver();
      harness.simulateMouseMove({
        clientX: mouseX,
        clientY: mouseY,
      });
      windowHarness.simulateKeydown(TriggerType.O);

      assert($onEvent.get(_.tester.vine)).toNot.emit();
    });

    should('not emit when not hovered', () => {
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T});

      const element = _.tester.createElement(TEST);
      const harness = getHarness(element, 'target', ElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      // Hover over the element, then hover off.
      harness.simulateMouseOver();
      harness.simulateMouseMove({
        clientX: mouseX,
        clientY: mouseY,
      });
      harness.simulateMouseOut();
      windowHarness.simulateKeydown(TriggerType.T);

      // Press the key
      window.dispatchEvent(new KeyboardEvent('keydown', {key: TriggerType.T}));

      assert($onEvent.get(_.tester.vine)).toNot.emit();
    });

    should('only emit on the inner component', () => {
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T});

      const element = _.tester.createElement(PARENT);
      const testEl = getHarness(element, 'test', ElementHarness).target;
      const harness = getHarness(testEl, 'target', ElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      harness.simulateMouseOver();
      harness.simulateMouseMove({
        clientX: mouseX,
        clientY: mouseY,
      });

      windowHarness.simulateKeydown(TriggerType.T);

      assert($onEvent.get(_.tester.vine)).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({mouseX, mouseY}),
      ]);
      assert($onParentEvent.get(_.tester.vine)).toNot.emit();
    });
  });

  test('createTrigger', () => {
    should('trigger if modifiers match', () => {
      $triggerSpec.get(_.tester.vine).next({
        type: TriggerType.T,
        alt: true,
        ctrl: true,
        meta: true,
        shift: true,
      });

      const element = _.tester.createElement(TEST);
      const harness = getHarness(element, 'target', ElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      harness.simulateMouseOver();
      harness.simulateMouseMove({
        clientX: mouseX,
        clientY: mouseY,
      });

      windowHarness.simulateKeydown(TriggerType.T, {
        altKey: true,
        ctrlKey: true,
        metaKey: true,
        shiftKey: true,
      });

      assert($onEvent.get(_.tester.vine)).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({
          altKey: true,
          ctrlKey: true,
          metaKey: true,
          mouseX,
          mouseY,
          shiftKey: true,
        }),
      ]);
    });

    should('match both true and false if undefined', () => {
      $triggerSpec.get(_.tester.vine).next({
        type: TriggerType.T,
        alt: undefined,
        ctrl: undefined,
        meta: undefined,
        shift: undefined,
      });

      const element = _.tester.createElement(TEST);
      const harness = getHarness(element, 'target', ElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      harness.simulateMouseOver();
      harness.simulateMouseMove({
        clientX: mouseX,
        clientY: mouseY,
      });

      windowHarness.simulateKeydown(TriggerType.T, {
        altKey: true,
        ctrlKey: true,
        metaKey: true,
        shiftKey: true,
      });

      windowHarness.simulateKeydown(TriggerType.T, {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      });

      assert($onEvent.get(_.tester.vine)).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({
          altKey: true,
          ctrlKey: true,
          metaKey: true,
          mouseX,
          mouseY,
          shiftKey: true,
        }),
        objectThat<TriggerDetails>().haveProperties({
          altKey: false,
          ctrlKey: false,
          metaKey: false,
          mouseX,
          mouseY,
          shiftKey: false,
        }),
      ]);
    });
  });
});