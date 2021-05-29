import {Snapshot, StateId, StateService} from 'gs-tools/export/state';
import {LocalStorage} from 'gs-tools/export/store';
import {$saveConfig, registerSvg, start, UrlThemeLoader} from 'mask';
import {identity, json} from 'nabu';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {activeSpec} from '../src/core/active';
import {slotSpec, SlotSpec} from '../src/region/slot';

import protoboardSvg from './asset/icon.svg';
import {$locationService} from './core/location-service';
import {Root} from './root';
import {DemoState} from './state/types/demo-state';
import {PieceSpec} from './state/types/piece-spec';
import {FACE_ICONS} from './state/types/piece-state';
import {PieceType} from './state/types/piece-type';
import {PlayState} from './state/types/play-state';
import {RegionSpec} from './state/types/region-spec';
import {RegionType} from './state/types/region-type';


const iconConfigs: Map<string, string> = new Map([
  ['protoboard', protoboardSvg],
]);

const webConsoleDestination = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(log => {
  webConsoleDestination.log(log);
});

window.addEventListener('load', () => {
  const {vine} = start(
      'protoboard',
      [Root],
      document,
      new UrlThemeLoader('theme.css'),
  );

  for (const [key, content] of iconConfigs) {
    registerSvg(vine, key, {type: 'embed', content});
  }

  $locationService.get(vine).run().subscribe();

  const storage = new LocalStorage<Snapshot<DemoState>, any>(
      window,
      'pbd',
      identity(),
      json(),
  );

  $saveConfig.get(vine).next({
    loadOnInit: true,
    saveId: 'save',
    storage,
    initFn: init,
  });
});

function init(stateService: StateService): StateId<DemoState> {
  return stateService.modify(x => x.add({
    $isStaging: x.add(true),
    $playState: x.add<PlayState>({
      $supply: x.add<SlotSpec>(slotSpec({$contentSpecs: x.add([])}, x)),
      objectSpecIds: [
        x.add(activeSpec({
          $contentSpecs: x.add([]),
        })),
      ],
    }),
    pieceEditorState: {
      [PieceType.D1]: {
        length: 1,
        $editedFace: x.add<number>(0),
        $faceIcons: x.add<readonly string[]>(FACE_ICONS.slice(0, 1)),
      },
      [PieceType.D2]: {
        length: 2,
        $editedFace: x.add<number>(0),
        $faceIcons: x.add<readonly string[]>(FACE_ICONS.slice(0, 2)),
      },
      [PieceType.D6]: {
        length: 6,
        $editedFace: x.add<number>(0),
        $faceIcons: x.add<readonly string[]>([...FACE_ICONS, ...FACE_ICONS.slice(0, 2)]),
      },
    },
    regionEditorState: {
      [RegionType.DECK]: {
        $targetArea: x.add(0),
      },
    },
    stagingState: {
      $pieceSpecs: x.add<readonly PieceSpec[]>([]),
      $regionSpecs: x.add<readonly RegionSpec[]>([]),
    },
  }));
}
