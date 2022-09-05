import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {renderTextNode} from 'persona';
import {setupTest} from 'persona/export/testing';
import {of} from 'rxjs';

import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {LENS_DISPLAY} from './lens-display';
import {$lensService} from './lens-service';


test('@protoboard2/src/face/lens-display', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/face/goldens', goldens));
    const tester = setupTest({roots: [LENS_DISPLAY], overrides: [THEME_LOADER_TEST_OVERRIDE]});

    return {tester};
  });

  test('contentSpec$', () => {
    should('render the elements correctly', () => {
      $lensService.get(_.tester.vine).show({
        renderLensFn: () => renderTextNode({textContent: of('Rendered details')}),
      });

      const element = _.tester.bootstrapElement(LENS_DISPLAY);
      assert(element).to.matchSnapshot('lens-display__show.html');
    });

    should('remove the content if the lens service emits null', () => {
      const lensService = $lensService.get(_.tester.vine);
      lensService.show({
        renderLensFn: () => renderTextNode({textContent: of('Rendered details')}),
      });

      const element = _.tester.bootstrapElement(LENS_DISPLAY);
      lensService.hide();

      assert(element).to.matchSnapshot('lens-display__hide.html');
    });
  });
});
