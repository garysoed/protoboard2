import {$stateService} from 'grapevine';
import {Snapshot, StateId, StateService} from 'gs-tools/export/state';
import {LocalStorage} from 'gs-tools/export/store';
import {$saveConfig, $saveService, registerSvg, start, UrlThemeLoader} from 'mask';
import {identity, json} from 'nabu';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {activeSpec, ACTIVE_TYPE, renderActive} from '../src/core/active';
import {$$activeSpec} from '../src/objects/active-spec';
import {$createSpecEntries} from '../src/objects/object-create-spec';
import {slotSpec, SlotSpec} from '../src/region/slot';

import protoboardSvg from './asset/icon.svg';
import {$locationService} from './core/location-service';
import {PIECE_TYPE, REGION_TYPE, renderDemoPiece, renderDemoRegion, renderRootSlot, renderSupply, ROOT_SLOT_TYPE, SUPPLY_TYPE} from './core/object-specs';
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

  const saveService = $saveService.get(vine);
  saveService.setSaving(true);
  saveService.run().subscribe();
  $saveConfig.get(vine).next({
    loadOnInit: true,
    saveId: 'save',
    storage,
    initFn: init,
  });

  const stateService = $stateService.get(vine);
  $$activeSpec.get(vine).next(stateService.modify(x => x.add(activeSpec({
    $contentSpecs: x.add([]),
  }))));

  const createSpecEntries$ = $createSpecEntries.get(vine);
  createSpecEntries$.next([ACTIVE_TYPE, renderActive]);
  createSpecEntries$.next([ROOT_SLOT_TYPE, renderRootSlot]);
  createSpecEntries$.next([SUPPLY_TYPE, renderSupply]);
  createSpecEntries$.next([PIECE_TYPE, renderDemoPiece]);
  createSpecEntries$.next([REGION_TYPE, renderDemoRegion]);
});

function init(stateService: StateService): StateId<DemoState> {
  return stateService.modify(x => x.add({
    $isStaging: x.add(true),
    $playState: x.add<PlayState>({
      $supply: x.add<SlotSpec>(slotSpec({
        type: SUPPLY_TYPE,
        $contentSpecs: x.add([]),
      })),
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
