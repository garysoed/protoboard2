import { $icon } from 'mask';
import { PersonaContext, renderCustomElement, renderElement } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { Indexed } from '../../src/coordinate/indexed';
import { $baseComponent } from '../../src/core/base-component';
import { ObjectSpec } from '../../src/objects/object-spec';
import { IsContainer } from '../../src/payload/is-container';
import { $slot } from '../../src/region/slot';

import { GenericPiecePayload } from './staging-area';


export const ROOT_SLOT_TYPE = 'pbd.rootSlot';

export function renderRootSlot(
    spec: ObjectSpec<IsContainer<Indexed>>,
    context: PersonaContext,
): Observable<Node> {
  return renderCustomElement(
      $slot,
      {inputs: {objectId: observableOf(spec.id)}},
      context,
  );
}

export const SUPPLY_TYPE = 'pbd.supply';

export function renderSupply(
    spec: ObjectSpec<IsContainer<Indexed>>,
    context: PersonaContext,
): Observable<Node> {
  return renderCustomElement(
      $slot,
      {inputs: {objectId: observableOf(spec.id)}},
      context,
  );
}

export const PREVIEW_TYPE = 'pbd.preview';

export function renderDemoPreview(
    state: ObjectSpec<GenericPiecePayload>,
    context: PersonaContext,
): Observable<Node> {
  const icon$list = state.payload.icons.map((icon, index) => {
    const icon$ = renderCustomElement(
        $icon,
        {
          inputs: {icon: observableOf(icon)},
          attrs: new Map([
          ]),
        },
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
        context,
    );
  });

  return renderElement(
      state.payload.componentTag,
      {
        children: icon$list.length <= 0 ? observableOf([]) : combineLatest(icon$list),
        attrs: new Map([
          [$baseComponent.api.objectId.attrName, observableOf(state.id)],
        ]),
      },
      context,
  );
}
