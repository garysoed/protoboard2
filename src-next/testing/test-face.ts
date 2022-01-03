import {cache} from 'gs-tools/export/data';
import {$svgService, registerSvg} from 'mask';
import {Context, Ctrl, DIV, iattr, id, itarget, osingle, registerCustomElement, renderHtml} from 'persona';
import {Observable} from 'rxjs';
import {map, withLatestFrom, tap} from 'rxjs/operators';

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
              raw,
              parseType: 'image/svg+xml',
              id: raw,
            });
          }),
          this.$.shadow.root.content(),
      ),
      this.$.host.shade.pipe(
          withLatestFrom(this.$.shadow.root.element),
          tap(([shade, target]) => {
            target.style.setProperty('--pbtShade', shade);
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