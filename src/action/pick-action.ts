import {$resolveState, $stateService} from 'grapevine';
import {$asArray, $map, $max, $pipe, normal} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction} from '../core/base-action';
import {$activeSpec} from '../objects/active-spec';
import {$getParent} from '../objects/content-map';
import {PieceSpec} from '../types/piece-spec';

import {moveObject} from './util/move-object';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Config { }

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<PieceSpec<any>, Config> {
  /**
   * @internal
   */
  constructor(
      context: ActionContext<PieceSpec<any>, Config>,
      defaultConfig: Config,
  ) {
    super(
        'pick',
        'Pick',
        {},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    const fromObjectSpec$ = combineLatest([
      this.context.objectId$,
      $getParent.get(this.vine),
    ])
        .pipe(
            map(([objectId, getParent]) => {
              if (!objectId) {
                return null;
              }
              return getParent(objectId);
            }),
            switchMap(fromObjectId => {
              if (!fromObjectId) {
                return observableOf(null);
              }
              return $resolveState.get(this.vine)(fromObjectId);
            }),
        );
    const activeContents$ = $activeSpec.get(this.vine).pipe(
        switchMap(activeSpec => {
          if (!activeSpec) {
            return observableOf(undefined);
          }
          return $stateService.get(this.vine).resolve(activeSpec.payload.$contentSpecs);
        }),
    );

    const moveFn$ = combineLatest([
      fromObjectSpec$,
      $activeSpec.get(this.vine),
      activeContents$,
      this.context.objectId$,
    ])
        .pipe(
            switchMap(([fromObjectSpec, activeState, activeContents, movedObjectId]) => {
              if (!fromObjectSpec || !activeState || !movedObjectId) {
                return observableOf(null);
              }

              return moveObject(
                  fromObjectSpec.payload,
                  activeState.payload,
                  this.vine,
              )
                  .pipe(
                      map(fn => {
                        if (!fn) {
                          return null;
                        }

                        return () => {
                          const destIndex = $pipe(
                              activeContents ?? [],
                              $map(content => content.coordinate.index),
                              $asArray(),
                              $max(normal()),
                          );

                          fn(movedObjectId, {index: (destIndex ?? 0) + 1});
                        };
                      }),
                  );
            }),
        );

    return this.onTrigger$
        .pipe(
            withLatestFrom(moveFn$),
            tap(([, moveFn]) => {
              if (!moveFn) {
                return;
              }

              moveFn();
            }),
        );
  }
}
