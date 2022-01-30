import {cache} from 'gs-tools/export/data';
import {stringType} from 'gs-types';
import {$svgService, registerSvg} from 'mask';
import {Context, Ctrl, DIV, iattr, id, itarget, osingle, registerCustomElement, renderCustomElement, renderHtml, RenderSpec} from 'persona';
import {Observable, of} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import testSvg from '../asset/icon.svg';

import template from './test-face.html';


const $testFace = {
  host: {
    shade: iattr('shade'),
  },
  shadow: {
    root: id('root', DIV, {
      content: osingle(),
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
          map(raw => {
            if (!raw) {
              return null;
            }
            return renderHtml({
              raw: of(raw),
              parseType: 'image/svg+xml',
              id: raw,
            });
          }),
          this.$.shadow.root.content(),
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
  return renderCustomElement({
    registration: TEST_FACE,
    id,
    attrs: new Map([
      ['shade', of(id)],
      ['slot', of('face-0')],
    ]),
  });
}