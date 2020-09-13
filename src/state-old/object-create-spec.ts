import { PersonaContext } from 'persona';
import { Observable } from 'rxjs';

import { State } from './state';


/**
 * Function called when creating the object corresponding to the state.
 *
 * @thHidden
 */
export type ObjectCreateSpec<P extends object> =
    (state: State<P>, context: PersonaContext) => Observable<Node>;
