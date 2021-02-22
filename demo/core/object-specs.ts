import {Vine} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$icon} from 'mask';
import {renderCustomElement, renderElement, RenderSpec} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {$baseComponent} from '../../src/core/base-component';
import {$getObjectSpec} from '../../src/objects/getters/root-state';
import {IsContainer} from '../../src/payload/is-container';
import {$slot} from '../../src/region/slot';
import {ObjectSpec} from '../../src/types/object-spec';
import {PieceSpec} from '../state/types/piece-spec';
import {RegionSpec} from '../state/types/region-spec';


export const ROOT_SLOT_TYPE = 'pbd.rootSlot';

export function renderRootSlot(
    objectId: StateId<ObjectSpec<IsContainer<'indexed'>>>,
): Observable<RenderSpec> {
  return observableOf(renderCustomElement({
    spec: $slot,
    inputs: {objectId},
    id: objectId.id,
  }));
}

export const SUPPLY_TYPE = 'pbd.supply';

export function renderSupply(
    objectId: StateId<ObjectSpec<IsContainer<'indexed'>>>,
): Observable<RenderSpec|null> {
  return observableOf(renderCustomElement({
    spec: $slot,
    inputs: {objectId},
    id: objectId.id,
  }));
}

export const PIECE_TYPE = 'pbd.piece';
export const REGION_TYPE = 'pbd.region';

export function renderDemoPiece(
    objectId: StateId<ObjectSpec<PieceSpec>>,
    vine: Vine,
): Observable<RenderSpec|null> {
  return $getObjectSpec.get(vine)(objectId).pipe(
      map(state => {
        if (!state) {
          return null;
        }

        const icon$list = state.payload.icons.map((icon, index) => {
          const icon$ = renderCustomElement({
            spec: $icon,
            inputs: {icon},
            attrs: new Map([]),
            id: icon,
          });
          return renderElement({
            tag: 'div',
            attrs: new Map([
              ['style', 'height: 3rem; width: 3rem;'],
              ['slot', `face-${index}`],
            ]),
            children: [icon$],
            id: index,
          });
        });

        return renderElement({
          tag: state.payload.componentTag,
          children: icon$list,
          attrs: new Map([
            [$baseComponent.api.objectId.attrName, objectId.id],
          ]),
          id: objectId.id,
        });
      }),
  );
}

export function renderDemoRegion(
    objectId: StateId<ObjectSpec<RegionSpec>>,
    vine: Vine,
): Observable<RenderSpec|null> {
  return $getObjectSpec.get(vine)(objectId).pipe(
      map(state => {
        if (!state) {
          return null;
        }
        return renderElement({
          tag: state.payload.componentTag,
          attrs: new Map([
            [$baseComponent.api.objectId.attrName, objectId.id],
          ]),
          id: objectId.id,
        });
      }),
  );
}
