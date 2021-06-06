import {arrayThat, assert, createSpyInstance, createSpySubject, objectThat, run, runEnvironment, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {StateService} from 'gs-tools/export/state';
import {$div, attributeIn, element, host, integerParser, PersonaContext} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {$helpService, ActionTrigger, HelpService} from '../action/help-service';
import {triggerKey} from '../action/testing/trigger-key';

import {$baseComponent, BaseComponent} from './base-component';
import {DetailedTriggerSpec, triggerSpecParser, TriggerType, UnreservedTriggerSpec} from './trigger-spec';


interface ActionConfig extends TriggerConfig {
  readonly value: number;
}

const ACTION_NAME = 'test';

function testAction(
    trigger: UnreservedTriggerSpec,
    attrName: string,
): ActionSpec<ActionConfig> {
  return {
    action: () => EMPTY,
    actionName: ACTION_NAME,
    configSpecs: host({
      value: attributeIn(attrName, integerParser(), 0),
      trigger: attributeIn('pb-test-trigger', triggerSpecParser(), trigger),
    })._,
  };
}

const $ = {
  host: host($baseComponent.api),
};

class TestComponent extends BaseComponent<{}, typeof $> {
  constructor(
      private readonly triggerActions: ReadonlyArray<ActionSpec<any>>,
      context: PersonaContext,
  ) {
    super(context, $);
  }

  @cache()
  protected get actions(): ReadonlyArray<ActionSpec<TriggerConfig>> {
    return this.triggerActions;
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

const KEY = TriggerType.T;

test('@protoboard2/core/base-component', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const $targetEl = element('target', $div, {});
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});

    const mockHelpService = createSpyInstance(HelpService);
    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $helpService, withValue: mockHelpService},
      ],
    });
    const component = new TestComponent(
        [
          testAction(
              {type: TriggerType.CLICK, targetEl: $targetEl},
              'pb-test-value',
          ),
          testAction(
              {type: KEY, targetEl: $targetEl},
              'pb-test2-value',
          ),
        ],
        personaContext,
    );
    run(component.run());

    return {
      component,
      el,
      mockHelpService,
      personaContext,
    };
  });

  test('objectId$', () => {
    should('emit the object ID if exists', () => {
      const stateService = new StateService();
      const objectId = stateService.modify(x => x.add({}));
      _.el.setAttribute('object-id', $baseComponent.api.objectId.createAttributePair(objectId)[1]);

      const objectId$ = createSpySubject(_.component.objectId$);
      assert(objectId$.pipe(map(({id}) => id))).to.emitSequence([objectId.id]);
    });
  });

  test('setupAction', () => {
    should('set up the help action', () => {
      triggerKey(
          _.el,
          {
            key: TriggerType.QUESTION,
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: true,
          },
      );

      assert(_.mockHelpService.show).to.haveBeenCalledWith(
          arrayThat<ActionTrigger>().haveExactElements([
            objectThat<ActionTrigger>().haveProperties({
              trigger: objectThat<DetailedTriggerSpec<TriggerType>>().haveProperties({
                type: TriggerType.CLICK,
              }),
              actionName: ACTION_NAME,
            }),
            objectThat<ActionTrigger>().haveProperties({
              trigger: objectThat<DetailedTriggerSpec<TriggerType>>().haveProperties({
                type: KEY,
              }),
              actionName: ACTION_NAME,
            }),
          ]),
      );
    });
  });
});
