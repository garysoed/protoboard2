import {StateId} from 'gs-tools/export/state';
import {$icon} from 'mask';
import {NodeWithId, PersonaContext, renderCustomElement, renderElement} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$baseComponent} from '../../src/core/base-component';
import {$getObjectSpec} from '../../src/objects/getters/root-state';
import {ObjectSpec} from '../../src/objects/object-spec';
import {IsContainer} from '../../src/payload/is-container';
import {$slot} from '../../src/region/slot';
import {PieceSpec} from '../state/types/piece-spec';
import {RegionSpec} from '../state/types/region-spec';


export const ROOT_SLOT_TYPE = 'pbd.rootSlot';

export function renderRootSlot(
    objectId: StateId<ObjectSpec<IsContainer<'indexed'>>>,
    context: PersonaContext,
): Observable<NodeWithId<Element>> {
  return renderCustomElement(
      $slot,
      {inputs: {objectId: observableOf(objectId)}},
      objectId.id,
      context,
  );
}

export const SUPPLY_TYPE = 'pbd.supply';

export function renderSupply(
    objectId: StateId<ObjectSpec<IsContainer<'indexed'>>>,
    context: PersonaContext,
): Observable<NodeWithId<Element>> {
  return renderCustomElement(
      $slot,
      {inputs: {objectId: observableOf(objectId)}},
      objectId.id,
      context,
  );
}

export const PIECE_TYPE = 'pbd.piece';
export const REGION_TYPE = 'pbd.region';

export function renderDemoPiece(
    objectId: StateId<ObjectSpec<PieceSpec>>,
    context: PersonaContext,
): Observable<NodeWithId<Element>|null> {
  return $getObjectSpec.get(context.vine).pipe(
      map(getObjectSpec => getObjectSpec(objectId)),
      switchMap(state => {
        if (!state) {
          return observableOf(null);
        }

        const icon$list = state.payload.icons.map((icon, index) => {
          const icon$ = renderCustomElement(
              $icon,
              {
                inputs: {icon: observableOf(icon)},
                attrs: new Map([
                ]),
              },
              icon,
              context,
          );
          return renderElement(
              'div',
              {
                attrs: new Map([
                  ['style', observableOf('height: 3rem; width: 3rem;')],
                  ['slot', observableOf(`face-${index}`)],
                ]),
                children: icon$.pipe(map(icon => [icon])),
              },
              index,
              context,
          );
        });

        return renderElement(
            state.payload.componentTag,
            {
              children: icon$list.length <= 0 ? observableOf([]) : combineLatest(icon$list),
              attrs: new Map([
                [$baseComponent.api.objectId.attrName, observableOf(objectId.id)],
              ]),
            },
            objectId.id,
            context,
        );
      }),
  );
}

export function renderDemoRegion(
    objectId: StateId<ObjectSpec<RegionSpec>>,
    context: PersonaContext,
): Observable<NodeWithId<Element>|null> {
  return $getObjectSpec.get(context.vine).pipe(
      map(getObjectSpec => getObjectSpec(objectId)),
      switchMap(state => {
        if (!state) {
          return observableOf(null);
        }
        return renderElement(
            state.payload.componentTag,
            {
              attrs: new Map([
                [$baseComponent.api.objectId.attrName, observableOf(objectId.id)],
              ]),
            },
            objectId.id,
            context,
        );
      }),
  );
}
