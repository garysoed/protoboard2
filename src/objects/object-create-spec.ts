import {StateId} from 'gs-tools/export/state';
import {NodeWithId, PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {ObjectSpec} from '../types/object-spec';


/**
 * Function called when creating the object corresponding to the state.
 *
 * @thHidden
 */
export type ObjectCreateSpec<O extends ObjectSpec<any>> = (
    objectId: StateId<O>,
    context: PersonaContext,
) => Observable<NodeWithId<Element>|null>;
