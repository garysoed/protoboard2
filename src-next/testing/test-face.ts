import {cache} from 'gs-tools/export/data';
import {stringType, unknownType} from 'gs-types';
import {$svgService, registerSvg} from 'mask';
import {Context, Ctrl, DIV, iattr, ocase, oproperty, ParseType, query, registerCustomElement, renderElement, RenderSpec, renderString} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import testSvg from '../asset/icon.svg';
import {ComponentId, componentIdType, getPayload as getComponentPayload} from '../id/component-id';
import {FaceId, getPayload as getFacePayload} from '../id/face-id';

import template from './test-face.html';


const $testFace = {
  host: {
    shade: iattr('shade'),
  },
  shadow: {
    root: query('#root', DIV, {
      content: ocase<string|null>(),
      shade: oproperty('--pbtShade'),
    }),
  },
};

class TestFace implements Ctrl {
  constructor(private readonly $: Context<typeof $testFace>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $svgService.get(this.$.vine).getSvg('test').pipe(
          this.$.shadow.root.content(raw => {
            if (!raw) {
              return null;
            }
            return renderString({
              raw: of(raw),
              spec: {},
              parseType: ParseType.SVG,
            });
          }),
      ),
      this.$.host.shade.pipe(
          map(shade => shade ?? 'steelblue'),
          this.$.shadow.root.shade(),
      ),
    ];
  }
}

export const TEST_FACE = registerCustomElement({
  ctrl: TestFace,
  configure: vine => {
    registerSvg(vine, 'test', {type: 'embed', content: testSvg});
  },
  spec: $testFace,
  tag: 'pbt-face',
  template,
});

export function renderTestFace(id: ComponentId<unknown>|FaceId<unknown>): RenderSpec {
  const payload = getPayload(id);
  if (!stringType.check(payload)) {
    throw new Error(`Invalid ID ${id}`);
  }
  return renderElement({
    registration: TEST_FACE,
    spec: {},
    runs: $ => [
      of(payload).pipe($.shade()),
    ],
  });
}

function getPayload(id: ComponentId<unknown>|FaceId<unknown>): unknown {
  if (componentIdType(unknownType).check(id)) {
    return getComponentPayload(id);
  }

  return getFacePayload(id);
}