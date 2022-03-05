import {source} from 'grapevine';
import {assert, objectThat, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Context, Ctrl, DIV, query, itarget, registerCustomElement} from 'persona';
import {ElementHarness, getHarness, setupTest, windowHarness} from 'persona/export/testing';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';

import {TriggerElementHarness} from '../testing/trigger-element-harness';
import {TriggerSpec, TriggerType} from '../types/trigger-spec';

import {onTrigger} from './trigger';
import {TriggerDetails, TriggerEvent} from './trigger-event';


const $triggerSpec = source(() => new BehaviorSubject<TriggerSpec>({type: TriggerType.CLICK}));
const $containerTriggerSpec = source(() => new BehaviorSubject<TriggerSpec>({type: TriggerType.C}));
const $childTriggerSpec = source(() => new BehaviorSubject<TriggerSpec>({type: TriggerType.H}));
const $onEvent = source(() => new ReplaySubject<TriggerEvent>());
const $onContainerEvent = source(() => new ReplaySubject<TriggerEvent>());
const $onChildEvent = source(() => new ReplaySubject<TriggerEvent>());

const $test = {
  shadow: {
    child: query('#child', DIV, {
      target: itarget(),
    }),
    target: query('#target', DIV, {
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
      // Have a duplicate trigger
      this.$.shadow.target.target.pipe(
          onTrigger($triggerSpec.get(this.$.vine)),
      ),
      this.$.shadow.child.target.pipe(
          onTrigger($childTriggerSpec.get(this.$.vine)),
          forwardTo($onChildEvent.get(this.$.vine)),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  tag: 'pbt-test',
  template: '<div id="target"><div id="child"></div></div>',
});

const $parent = {
  shadow: {
    container: query('#container', DIV, {
      target: itarget(),
    }),
  },
};

class Container implements Ctrl {
  constructor(private readonly $: Context<typeof $parent>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.shadow.container.target.pipe(
          onTrigger($containerTriggerSpec.get(this.$.vine)),
          forwardTo($onContainerEvent.get(this.$.vine)),
      ),
    ];
  }
}

const CONTAINER = registerCustomElement({
  ctrl: Container,
  deps: [TEST],
  spec: $parent,
  tag: 'pbt-container',
  template: '<div id="container"><pbt-test id="test"></pbt-test></div>',
});

test('@protoboard2/src/trigger/trigger', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [CONTAINER]});
    return {tester};
  });

  test('createOnClick', () => {
    should('trigger click based actions', () => {
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.CLICK, alt: true, meta: true});

      const element = _.tester.createElement(TEST);
      const harness = getHarness(element, '#target', ElementHarness);
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

      assert($onEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
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
      const harness = getHarness(element, '#target', TriggerElementHarness);
      const altKey = true;
      const ctrlKey = false;
      const metaKey = true;
      const shiftKey = false;
      const mouseX = 12;
      const mouseY = 34;

      harness.simulateTrigger(TriggerType.T, {
        clientX: mouseX,
        clientY: mouseY,
        altKey,
        ctrlKey,
        metaKey,
        shiftKey,
      });

      assert($onEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
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
      const harness = getHarness(element, '#target', ElementHarness);
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
      const harness = getHarness(element, '#target', ElementHarness);
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

    should('only emit on the inner DOM if triggering and matching the inner DOM', () => {
      $childTriggerSpec.get(_.tester.vine).next({type: TriggerType.T});
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T});
      $containerTriggerSpec.get(_.tester.vine).next({type: TriggerType.T});

      const element = _.tester.createElement(CONTAINER);
      const testEl = getHarness(element, '#test', ElementHarness).target;
      const childHarness = getHarness(testEl, '#child', TriggerElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      childHarness.simulateTrigger(TriggerType.T, {clientX: mouseX, clientY: mouseY});

      assert($onChildEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({mouseX, mouseY}),
      ]);
      assert($onEvent.get(_.tester.vine)).toNot.emit();
      assert($onContainerEvent.get(_.tester.vine)).toNot.emit();
    });

    should('emit on the target if triggering on the inner DOM', () => {
      $childTriggerSpec.get(_.tester.vine).next({type: TriggerType.C});
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T});
      $containerTriggerSpec.get(_.tester.vine).next({type: TriggerType.T});

      const element = _.tester.createElement(CONTAINER);
      const testEl = getHarness(element, '#test', ElementHarness).target;
      const childHarness = getHarness(testEl, '#child', TriggerElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      childHarness.simulateTrigger(TriggerType.T, {clientX: mouseX, clientY: mouseY});

      assert($onChildEvent.get(_.tester.vine)).toNot.emit();
      assert($onEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({mouseX, mouseY}),
      ]);
      assert($onContainerEvent.get(_.tester.vine)).toNot.emit();
    });

    should('emit on the outer component if triggering on the inner DOM', () => {
      $childTriggerSpec.get(_.tester.vine).next({type: TriggerType.C});
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.C});
      $containerTriggerSpec.get(_.tester.vine).next({type: TriggerType.T});

      const element = _.tester.createElement(CONTAINER);
      const testEl = getHarness(element, '#test', ElementHarness).target;
      const childHarness = getHarness(testEl, '#child', TriggerElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      childHarness.simulateTrigger(TriggerType.T, {clientX: mouseX, clientY: mouseY});

      assert($onChildEvent.get(_.tester.vine)).toNot.emit();
      assert($onEvent.get(_.tester.vine)).toNot.emit();
      assert($onContainerEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({mouseX, mouseY}),
      ]);
    });

    should('only emit on the component if triggering and matching the inner component', () => {
      $childTriggerSpec.get(_.tester.vine).next({type: TriggerType.L});
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T});
      $containerTriggerSpec.get(_.tester.vine).next({type: TriggerType.T});

      const element = _.tester.createElement(CONTAINER);
      const testEl = getHarness(element, '#test', ElementHarness).target;
      const targetHarness = getHarness(testEl, '#target', TriggerElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      targetHarness.simulateTrigger(TriggerType.T, {clientX: mouseX, clientY: mouseY});

      assert($onChildEvent.get(_.tester.vine)).toNot.emit();
      assert($onEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({mouseX, mouseY}),
      ]);
      assert($onContainerEvent.get(_.tester.vine)).toNot.emit();
    });

    should('emit on the outer component if trigger on the inner component', () => {
      $childTriggerSpec.get(_.tester.vine).next({type: TriggerType.L});
      $triggerSpec.get(_.tester.vine).next({type: TriggerType.T});
      $containerTriggerSpec.get(_.tester.vine).next({type: TriggerType.C});

      const element = _.tester.createElement(CONTAINER);
      document.body.appendChild(element);
      const testEl = getHarness(element, '#test', ElementHarness).target;
      const targetHarness = getHarness(testEl, '#target', TriggerElementHarness);
      const mouseX = 12;
      const mouseY = 34;

      targetHarness.simulateTrigger(TriggerType.C, {clientX: mouseX, clientY: mouseY});

      assert($onChildEvent.get(_.tester.vine)).toNot.emit();
      assert($onEvent.get(_.tester.vine)).toNot.emit();
      assert($onContainerEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
        objectThat<TriggerDetails>().haveProperties({mouseX, mouseY}),
      ]);
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
      const harness = getHarness(element, '#target', ElementHarness);
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

      assert($onEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
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
      const harness = getHarness(element, '#target', ElementHarness);
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

      assert($onEvent.get(_.tester.vine).pipe(map(event => event.details))).to.emitSequence([
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