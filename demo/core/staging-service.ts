import { stream, Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { SimpleIdGenerator } from 'gs-tools/export/random';
import { $icon } from 'mask';
import { renderCustomElement, renderElement } from 'persona';
import { BehaviorSubject, combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { DroppablePayload } from '../../src/action/payload/droppable-payload';
import { OrientablePayload } from '../../src/action/payload/orientable-payload';
import { RotatablePayload } from '../../src/action/payload/rotatable-payload';
import { $baseComponent } from '../../src/core/base-component';
import { registerStateHandler } from '../../src/state/renderable-service';
import { SavedState } from '../../src/state/saved-state';
import { $stateService } from '../../src/state/state-service';

import { PieceSpec } from './piece-spec';
import { $saveService, SaveService } from './save-service';


const DEMO_PREVIEW_TYPE = 'pbd-demo';

export interface GenericPiecePayload extends
    PieceSpec, OrientablePayload, RotatablePayload, DroppablePayload {
}

export class StagingService {
  readonly #isStaging$ = new BehaviorSubject(true);
  readonly #states$ = new BehaviorSubject<ReadonlySet<SavedState<object>>>(new Set());
  private readonly idGenerator = new SimpleIdGenerator();

  get isStaging$(): Observable<boolean> {
    return this.#isStaging$;
  }

  @cache()
  get states$(): Observable<ReadonlySet<SavedState<object>>> {
    return this.#states$;
  }

  constructor(
      private readonly saveService: SaveService,
      private readonly vine: Vine,
  ) {
    this.init();
  }

  addPiece(spec: PieceSpec): Observable<unknown> {
    return this.addObject(DEMO_PREVIEW_TYPE, spec);
  }

  clear(): void {
    this.#states$.next(new Set());
  }

  setStaging(staging: boolean): void {
    this.#isStaging$.next(staging);
    this.saveService.setSaving(!staging);
  }

  private addObject(objectType: string, pieceSpec: PieceSpec): Observable<unknown> {
    return $stateService.get(this.vine).pipe(
        switchMap(stateService => stateService.objectIds$),
        tap(objectIds => {
          const id = this.idGenerator.generate(objectIds);
          const payload: GenericPiecePayload = {
            ...pieceSpec,
            faceIndex: 0,
            rotationIndex: 0,
            contentIds: [],
          };
          const state = {
            type: objectType,
            id,
            payload,
          };
          const states = this.#states$.getValue();
          this.#states$.next(new Set([...states, state]));
        }),
        take(1),
    );
  }

  private init(): void {
    registerStateHandler<PieceSpec>(
        DEMO_PREVIEW_TYPE,
        (state, context) => {
          const icon$ = state.payload.icons.pipe(
              switchMap(icons => {
                const icon$list = icons.map((icon, index) => renderCustomElement(
                    $icon,
                    {
                      inputs: {icon: observableOf(icon)},
                      attrs: new Map([
                        ['slot', observableOf(`face-${index}`)],
                      ]),
                    },
                    context,
                ));

                return icon$list.length <= 0 ? observableOf([]) : combineLatest(icon$list);
              }),
          );
          return state.payload.componentTag.pipe(
              switchMap(componentTag => {
                return renderElement(
                    componentTag,
                    {
                      children: icon$,
                      attrs: new Map([
                        [$baseComponent.api.objectId.attrName, observableOf(state.id)],
                      ]),
                    },
                    context,
                );
              }),
          );
        },
        this.vine,
    );
  }
}

export const $stagingService = stream(
    'StagingService',
    vine => $saveService.get(vine)
        .pipe(
            map(saveService => new StagingService(saveService, vine)),
        ),
    globalThis,
);
