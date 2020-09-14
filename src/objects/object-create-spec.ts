import { PersonaContext } from 'persona';
import { Observable } from 'rxjs';

import { ObjectSpec } from './object-spec';


/**
 * Function called when creating the object corresponding to the state.
 *
 * @thHidden
 */
export type ObjectCreateSpec<P> =
    (state: ObjectSpec<P>, context: PersonaContext) => Observable<Node>;
