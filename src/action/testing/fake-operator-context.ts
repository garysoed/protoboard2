import {Vine} from 'grapevine';
import {EMPTY} from 'rxjs';

import {OperatorContext} from '../../core/base-action';
import {ObjectSpec} from '../../types/object-spec';


export function createFakeOperatorContext<O extends ObjectSpec<any>, C>(
    context: Partial<OperatorContext<O, C>> & {readonly vine: Vine},
): OperatorContext<O, C> {
  return {
    config$: EMPTY,
    objectId$: EMPTY,
    ...context,
  };
}
