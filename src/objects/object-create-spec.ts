import {StateId} from 'gs-tools/export/state';
import {NodeWithId, PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {ObjectSpec} from './object-spec';


/**
 * Function called when creating the object corresponding to the state.
 *
 * @thHidden
 */
export type ObjectCreateSpec<P> = (
    objectId: StateId<ObjectSpec<P>>,
    context: PersonaContext,
) => Observable<NodeWithId<Element>|null>;
