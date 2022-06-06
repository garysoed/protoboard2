import {cache} from 'gs-tools/export/data';
import {stringType} from 'gs-types';
import {$svgService, registerSvg} from 'mask';
import {Context, Ctrl, DIV, iattr, itarget, ocase, query, registerCustomElement, renderElement, renderHtml, RenderSpec} from 'persona';
import {Observable, of} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import testSvg from '../asset/icon.svg';

import template from './test-face.html';


const $testFace = {
  host: {
    shade: iattr('shade'),
  },
  shadow: {
    root: query('#root', DIV, {
      content: ocase<string|null>(),
      element: itarget(),
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
            return renderHtml({
              raw: of(raw),
              parseType: 'image/svg+xml',
            });
          }),
      ),
      this.$.host.shade.pipe(
          withLatestFrom(this.$.shadow.root.element),
          tap(([shade, target]) => {
            target.style.setProperty('--pbtShade', shade ?? 'steelblue');
          }),
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

export function renderTestFace(id: unknown): RenderSpec {
  if (!stringType.check(id)) {
    throw new Error(`Invalid ID ${id}`);
  }
  return renderElement({
    registration: TEST_FACE,
    spec: {},
    runs: $ => [
      of(id).pipe($.shade()),
    ],
  });
}