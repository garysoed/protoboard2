import {flattenResolver} from 'gs-tools/export/state';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {$activeState} from '../core/active-spec';
import {BaseComponentSpecType} from '../core/base-component';
import {ComponentState} from '../types/component-state';


export function pickAction($: Context<BaseComponentSpecType<ComponentState>>): OperatorFunction<unknown, unknown> {
  const activeState = $activeState.get($.vine);
  return pipe(
      withLatestFrom(flattenResolver($.host.state)._('id'), activeState.$('contentIds')),
      map(([, id, contentIds]) => {
        return [...contentIds, id];
      }),
      activeState.$('contentIds').set(),
  );
}
