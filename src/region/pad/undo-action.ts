import {filterNonNullable, walkObservable} from 'gs-tools/export/rxjs';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../../core/base-component';

import {PadState} from './pad-state';

export function undoAction($: Context<BaseComponentSpecType<PadState>>): OperatorFunction<unknown, unknown> {
  const contents$ = walkObservable($.host.state.pipe(filterNonNullable())).$('contents');
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