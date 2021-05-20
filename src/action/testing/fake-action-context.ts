import {Vine} from 'grapevine';
import {EMPTY} from 'rxjs';

import {ObjectSpec} from '../../types/object-spec';
import {ActionContext} from '../action-context';


export function createFakeActionContext<O extends ObjectSpec<any>, C>(
    context: Partial<ActionContext<O, C>> & {readonly vine: Vine},
): ActionContext<O, C> {
  return {
    config$: EMPTY,
    objectId$: EMPTY,
    ...context,
  };
}
