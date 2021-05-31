import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {_p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {$, Canvas, CanvasEntry} from './canvas';
import {$canvasConfigService} from './canvas-config-service';
import {CanvasLine} from './canvas-entry';
import goldenDefault from './goldens/canvas__default.html';
import goldenNoconfig from './goldens/canvas__noconfig.html';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@protoboard2/src/face/canvas', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({
      default: goldenDefault,
      noConfig: goldenNoconfig,
    }));

    const stateService = fakeStateService();
    const tester = TESTER_FACTORY.build({
      rootCtrls: [Canvas],
      rootDoc: document,
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: stateService},
      ],
    });
    const el = tester.createElement(Canvas);
    return {el, stateService, vine: tester.vine};
  });

  should('render the lines with correct styles', () => {
    const canvasConfigService = $canvasConfigService.get(_.vine);
    const configName1 = 'configName1';
    canvasConfigService.addConfig(
        configName1,
        {
          type: 'line',
          color: 'green',
          dashArray: ['10', '10'],
          linecap: 'round',
          width: '5',
        },
    );
    const configName2 = 'configName2';
    canvasConfigService.addConfig(
        configName2,
        {
          type: 'line',
          color: 'red',
          linecap: 'butt',
          width: '5',
        },
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      lines: x.add<readonly CanvasLine[]>([
        {fromX: 10, toX: 60, fromY: 20, toY: 50, configName: configName1},
        {fromX: 60, toX: 120, fromY: 50, toY: 30, configName: configName2},
      ]),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('default');
  });

  should('skip lines with unknown config names', () => {
    const canvasConfigService = $canvasConfigService.get(_.vine);
    const configName = 'configName';
    canvasConfigService.addConfig(
        configName,
        {
          type: 'line',
          color: 'red',
          linecap: 'butt',
          width: '5',
        },
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      lines: x.add<readonly CanvasLine[]>([
        {fromX: 10, toX: 60, fromY: 20, toY: 50, configName: 'unknownConfig'},
        {fromX: 60, toX: 120, fromY: 50, toY: 30, configName},
      ]),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('noConfig');
  });
});