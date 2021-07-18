import {arrayThat, assert, createSpyInstance, createSpySubject, objectThat, run, runEnvironment, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {StateService} from 'gs-tools/export/state';
import {objectPathParser} from 'mask';
import {$div, attributeIn, element, host, PersonaContext} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {EMPTY, Observable, of, fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionSpec} from '../action/action-spec';
import {$helpService, ActionTrigger, HelpContent, HelpService, ShowHelpEvent, SHOW_HELP_EVENT} from '../action/help-service';
import {triggerKey} from '../action/testing/trigger-key';
import {createTrigger} from '../action/util/setup-trigger';

import {BaseComponent} from './base-component';
import {TriggerSpec, TriggerType} from './trigger-spec';


const ACTION_NAME = 'test';

function testAction(trigger: TriggerSpec, context: PersonaContext): ActionSpec {
  const config$ = of({
    value: 0,
    trigger,
  });
  return {
    action: () => EMPTY,
    actionName: ACTION_NAME,
    triggerSpec$: config$.pipe(map(({trigger}) => trigger)),
    trigger$: config$.pipe(createTrigger(context)),
  };
}

const $api = {
  objectId: attributeIn('object-path', objectPathParser<{}>()),
};

const $ = {
  host: host($api),
};

class TestComponent extends BaseComponent<{}, typeof $> {
  constructor(
      private readonly triggerActions: readonly ActionSpec[],
      context: PersonaContext,
  ) {
    super(context, $, $.host._.objectId);
  }

  @cache()
  protected get actions(): readonly ActionSpec[] {
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
          testAction({type: TriggerType.CLICK, targetEl: $targetEl}, personaContext),
          testAction({type: KEY, targetEl: $targetEl}, personaContext),
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
      const objectId = stateService.addRoot({});
      const objectPath = stateService.immutablePath(objectId);
      _.el.setAttribute('object-path', $api.objectId.createAttributePair(objectPath)[1]);

      const objectId$ = createSpySubject(_.component.objectPath$);
      assert(objectId$.pipe(map(({id}) => id))).to.emitSequence([objectPath.id]);
    });
  });

  test('setupAction', () => {
    should('set up the help action', () => {
      const helpContent$ = createSpySubject(fromEvent<ShowHelpEvent>(_.el, SHOW_HELP_EVENT).pipe(
          map(event => event.contents),
      ));

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

      assert(helpContent$).to.emitSequence([
        arrayThat<HelpContent>().haveExactElements([
          objectThat<HelpContent>().haveProperties({
            tag: 'DIV',
            actions: arrayThat<ActionTrigger>().haveExactElements([
              objectThat<ActionTrigger>().haveProperties({
                trigger: objectThat<TriggerSpec>().haveProperties({
                  type: TriggerType.CLICK,
                }),
                actionName: ACTION_NAME,
              }),
              objectThat<ActionTrigger>().haveProperties({
                trigger: objectThat<TriggerSpec>().haveProperties({
                  type: KEY,
                }),
                actionName: ACTION_NAME,
              }),
            ]),
          }),
        ]),
      ]);
    });
  });
});
