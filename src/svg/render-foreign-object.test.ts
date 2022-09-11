import {runEnvironment, setup, test, should, assert} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {instanceofType, Type} from 'gs-types';
import {Context, Ctrl, G, itarget, ivalue, ocase, ParseType, query, RECT, registerCustomElement, RenderSpec, renderString} from 'persona';
import {setupTest} from 'persona/export/testing';
import {Observable, OperatorFunction, of} from 'rxjs';
import {map} from 'rxjs/operators';

import goldens from './goldens/goldens.json';
import {renderForeignObject} from './render-foreign-object';

const OPERATOR_FUNCTION_TYPE: Type<RenderOperator> = instanceofType<OperatorFunction<unknown, RenderSpec>>(Function);
type RenderOperator = OperatorFunction<unknown, RenderSpec>;

const $test = {
  host: {
    operator: ivalue('operator', OPERATOR_FUNCTION_TYPE),
  },
  shadow: {
    g: query('g', G, {
      content: ocase<RenderOperator>(),
    }),
    rect: query('rect', RECT, {
      target: itarget(),
    }),
  },
};

class Test implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.host.operator.pipe(
          filterNonNullable(),
          this.$.shadow.g.content(map(renderContent => renderForeignObject({
            rect$: this.$.shadow.rect.target,
            renderContent,
          }))),
      ),
    ];
  }
}

const TEST = registerCustomElement({
  ctrl: Test,
  spec: $test,
  template: `
  <svg>
    <rect fill="grey" x="20" y="40" width="60" height="100"></rect>
    <g></g>
  </svg>
  `,
  tag: 'pbt-test',
});

test('@protoboard2/src/svg/render-foreign-object', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/svg/goldens', goldens));

    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('render the contents correctly', () => {
    const element = _.tester.bootstrapElement(TEST);
    element.operator = map(() => renderString({
      raw: of(`
      <div>
        <style>
          .red {
            background-color: red;
            position: absolute;
            left: 10px;
            top: 20px;
          }

          .green {
            background-color: green;
            position: absolute;
            left: 30px;
            top: 40px;
          }

          .box {
            height: 40px;
            width: 40px;
          }
        </style>

        <div class="red box"></div>
        <div class="green box"></div>
      </div>
      `),
      spec: {},
      parseType: ParseType.HTML,
    }));

    assert(element).to.matchSnapshot('render-foreign-object.html');
  });
});