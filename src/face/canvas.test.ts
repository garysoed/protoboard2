import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {registerSvg, _p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {$, Canvas, CanvasEntry} from './canvas';
import {$canvasConfigService} from './canvas-config-service';
import {CanvasIcon, CanvasLine} from './canvas-entry';
import goldenDefault from './goldens/canvas__default.html';
import goldenNoconfig from './goldens/canvas__noconfig.html';
import goldenNoicon from './goldens/canvas__noicon.html';
import dicePip3Svg from './testing/dice_pip_3.svg';
import meepleSvg from './testing/meeple.svg';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@protoboard2/src/face/canvas', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({
      default: goldenDefault,
      noConfig: goldenNoconfig,
      noIcon: goldenNoicon,
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

  should('render the lines and icons with correct configs', () => {
    const canvasConfigService = $canvasConfigService.get(_.vine);
    const lineConfigName1 = 'lineConfigName1';
    canvasConfigService.addConfig(
        lineConfigName1,
        {
          type: 'line',
          color: 'green',
          dashArray: ['10', '10'],
          linecap: 'round',
          width: '5',
        },
    );
    const lineConfigName2 = 'lineConfigName2';
    canvasConfigService.addConfig(
        lineConfigName2,
        {
          type: 'line',
          color: 'red',
          linecap: 'butt',
          width: '5',
        },
    );

    const svgName1 = 'svgName1';
    registerSvg(_.vine, svgName1, {type: 'embed', content: meepleSvg});
    const svgName2 = 'svgName2';
    registerSvg(_.vine, svgName2, {type: 'embed', content: dicePip3Svg});

    const iconConfigName1 = 'iconConfigName1';
    canvasConfigService.addConfig(
        iconConfigName1,
        {
          type: 'icon',
          svgName: svgName1,
          width: 20,
          height: 20,
        },
    );

    const iconConfigName2 = 'iconConfigName2';
    canvasConfigService.addConfig(
        iconConfigName2,
        {
          type: 'icon',
          svgName: svgName2,
          width: 30,
          height: 30,
        },
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      icons: x.add<readonly CanvasIcon[]>([
        {x: 20, y: 80, configName: iconConfigName1},
        {x: 80, y: 20, configName: iconConfigName2},
      ]),
      lines: x.add<readonly CanvasLine[]>([
        {fromX: 10, toX: 60, fromY: 20, toY: 50, configName: lineConfigName1},
        {fromX: 60, toX: 120, fromY: 50, toY: 30, configName: lineConfigName2},
      ]),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('default');
  });

  should('skip lines and icons with unknown config names', () => {
    const canvasConfigService = $canvasConfigService.get(_.vine);
    const lineConfigName = 'lineConfigName';
    canvasConfigService.addConfig(
        lineConfigName,
        {
          type: 'line',
          color: 'red',
          linecap: 'butt',
          width: '5',
        },
    );

    const svgName = 'svgName';
    registerSvg(_.vine, svgName, {type: 'embed', content: meepleSvg});

    const iconConfigName = 'iconConfigName';
    canvasConfigService.addConfig(
        iconConfigName,
        {
          type: 'icon',
          svgName,
          width: 20,
          height: 20,
        },
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      icons: x.add([
        {x: 20, y: 80, configName: iconConfigName},
        {x: 80, y: 20, configName: 'unknownIconConfig'},
      ]),
      lines: x.add<readonly CanvasLine[]>([
        {fromX: 10, toX: 60, fromY: 20, toY: 50, configName: 'unknownLineConfig'},
        {fromX: 60, toX: 120, fromY: 50, toY: 30, configName: lineConfigName},
      ]),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('noConfig');
  });

  should('render comments for icons with unknown icon name', () => {
    const canvasConfigService = $canvasConfigService.get(_.vine);
    const svgName = 'svgName';
    registerSvg(_.vine, svgName, {type: 'embed', content: meepleSvg});

    const iconConfigName1 = 'iconConfigName1';
    canvasConfigService.addConfig(
        iconConfigName1,
        {
          type: 'icon',
          svgName,
          width: 20,
          height: 20,
        },
    );

    const iconConfigName2 = 'iconConfigName2';
    canvasConfigService.addConfig(
        iconConfigName2,
        {
          type: 'icon',
          svgName: 'unknownSvg',
          width: 30,
          height: 30,
        },
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      icons: x.add<readonly CanvasIcon[]>([
        {x: 20, y: 80, configName: iconConfigName1},
        {x: 80, y: 20, configName: iconConfigName2},
      ]),
      lines: x.add([]),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('noIcon');
  });
});