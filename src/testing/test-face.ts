import {cache} from 'gs-tools/export/data';
import {$svgService, registerSvg} from 'mask';
import {Context, Ctrl, DIV, iattr, ocase, oproperty, ParseType, query, registerCustomElement, renderElement, RenderSpec, renderString} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import testSvg from '../asset/icon.svg';
import {FaceSpec} from '../types/is-multifaced';

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
          this.$.shadow.root.content(map(raw => {
            if (!raw) {
              return null;
            }
            return renderString({
              raw: of(raw),
              spec: {},
              parseType: ParseType.SVG,
            });
          })),
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

export function renderTestFace(shade: string): RenderSpec {
  return renderElement({
    registration: TEST_FACE,
    spec: {},
    runs: $ => [
      of(shade).pipe($.shade()),
    ],
  });
}

export function createRenderSpec(color: string): FaceSpec {
  return {
    renderSpec$: of(renderTestFace(color)),
    renderLensSpec$: of(renderTestFace(color)),
  };
}
