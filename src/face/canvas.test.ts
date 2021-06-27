import {$stateService} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {registerSvg, _p} from 'mask';
import {THEME_LOADER_TEST_OVERRIDE} from 'mask/export/testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {$, Canvas} from './canvas';
import {$canvasConfigService} from './canvas-config-service';
import {CanvasEntry, CanvasHalfLine, CanvasIcon, CanvasLine} from './canvas-entry';
import goldenDefault from './goldens/canvas__default.html';
import goldenNoconfig from './goldens/canvas__noconfig.html';
import goldenNoicon from './goldens/canvas__noicon.html';
import goldenNomouse from './goldens/canvas__nomouse.html';
import dicePip3Svg from './testing/dice_pip_3.svg';
import meepleSvg from './testing/meeple.svg';


const TESTER_FACTORY = new PersonaTesterFactory(_p);
test('@protoboard2/src/face/canvas', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({
      default: goldenDefault,
      noConfig: goldenNoconfig,
      noIcon: goldenNoicon,
      noMouse: goldenNomouse,
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

  should('render the lines, icons, and half line with correct configs', () => {
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
        {type: 'icon', svgName: svgName1},
    );

    const iconConfigName2 = 'iconConfigName2';
    canvasConfigService.addConfig(
        iconConfigName2,
        {type: 'icon', svgName: svgName2},
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      icons: x.add<readonly CanvasIcon[]>([
        {x: 20, y: 80, width: 20, height: 20, configName: iconConfigName1},
        {x: 80, y: 20, width: 30, height: 30, configName: iconConfigName2},
      ]),
      lines: x.add<readonly CanvasLine[]>([
        {fromX: 10, toX: 60, fromY: 20, toY: 50, configName: lineConfigName1},
        {fromX: 60, toX: 120, fromY: 50, toY: 30, configName: lineConfigName2},
      ]),
      halfLine: x.add<CanvasHalfLine>({fromX: 30, fromY: 30, configName: lineConfigName2}),
    }));
    _.el.setAttribute($.host._.objectId, objectId);
    _.el.dispatchEvent(
        $.root._.onMouseMove,
        new MouseEvent('mousemove', {clientX: 90, clientY: 40}),
    );

    assert(_.el.flattenContent()).to.matchSnapshot('default');
  });

  should('skip lines, icons, and half lines with unknown config names', () => {
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
        {type: 'icon', svgName},
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      icons: x.add([
        {x: 20, y: 80, width: 20, height: 20, configName: iconConfigName},
        {x: 80, y: 20, width: 30, height: 30, configName: 'unknownIconConfig'},
      ]),
      lines: x.add<readonly CanvasLine[]>([
        {fromX: 10, toX: 60, fromY: 20, toY: 50, configName: 'unknownLineConfig'},
        {fromX: 60, toX: 120, fromY: 50, toY: 30, configName: lineConfigName},
      ]),
      halfLine: x.add<CanvasHalfLine>({fromX: 30, fromY: 30, configName: 'unknownLineConfig'}),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('noConfig');
  });

  should('render lines and icons even without mouse events', () => {
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
        {type: 'icon', svgName: svgName1},
    );

    const iconConfigName2 = 'iconConfigName2';
    canvasConfigService.addConfig(
        iconConfigName2,
        {type: 'icon', svgName: svgName2},
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      icons: x.add<readonly CanvasIcon[]>([
        {x: 20, y: 80, width: 20, height: 20, configName: iconConfigName1},
        {x: 80, y: 20, width: 30, height: 30, configName: iconConfigName2},
      ]),
      lines: x.add<readonly CanvasLine[]>([
        {fromX: 10, toX: 60, fromY: 20, toY: 50, configName: lineConfigName1},
        {fromX: 60, toX: 120, fromY: 50, toY: 30, configName: lineConfigName2},
      ]),
      halfLine: x.add<CanvasHalfLine>({fromX: 30, fromY: 30, configName: lineConfigName2}),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('noMouse');
  });

  should('render comments for icons with unknown icon name', () => {
    const canvasConfigService = $canvasConfigService.get(_.vine);
    const svgName = 'svgName';
    registerSvg(_.vine, svgName, {type: 'embed', content: meepleSvg});

    const iconConfigName1 = 'iconConfigName1';
    canvasConfigService.addConfig(
        iconConfigName1,
        {type: 'icon', svgName},
    );

    const iconConfigName2 = 'iconConfigName2';
    canvasConfigService.addConfig(
        iconConfigName2,
        {type: 'icon', svgName: 'unknownSvg'},
    );

    const objectId = _.stateService.modify(x => x.add<CanvasEntry>({
      icons: x.add<readonly CanvasIcon[]>([
        {x: 20, y: 80, width: 20, height: 20, configName: iconConfigName1},
        {x: 80, y: 20, width: 30, height: 30, configName: iconConfigName2},
      ]),
      lines: x.add([]),
      halfLine: x.add(null),
    }));
    _.el.setAttribute($.host._.objectId, objectId);

    assert(_.el.flattenContent()).to.matchSnapshot('noIcon');
  });
});