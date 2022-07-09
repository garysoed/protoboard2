import {flattenResolver} from 'gs-tools/export/state';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';

import {PadState} from './pad-state';

export function undoAction($: Context<BaseComponentSpecType<PadState>>): OperatorFunction<unknown, unknown> {
  const contents$ = flattenResolver($.host.state).$('contents');
  return pipe(
      withLatestFrom(contents$),
      map(([, contents]) => {
        const newContents = [...contents];
        newContents.pop();
        return newContents;
      }),
      contents$.set(),
  );
}