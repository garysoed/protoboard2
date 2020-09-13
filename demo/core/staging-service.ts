import { stream, Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { SimpleIdGenerator } from 'gs-tools/export/random';
import { $icon } from 'mask';
import { renderCustomElement, renderElement } from 'persona';
import { BehaviorSubject, combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { $baseComponent } from '../../src/core/base-component';
import { $objectService, registerObjectCreateSpec } from '../../src/objects/object-service';
import { ObjectSpec } from '../../src/objects/object-spec';

import { PieceSpec } from './piece-spec';
import { $saveService, SaveService } from './save-service';


const DEMO_PREVIEW_TYPE = 'pbd-demo';

export class StagingService {
  readonly #isStaging$ = new BehaviorSubject(true);
  readonly #states$ = new BehaviorSubject<ReadonlySet<ObjectSpec<PieceSpec>>>(new Set());
  private readonly idGenerator = new SimpleIdGenerator();

  get isStaging$(): Observable<boolean> {
    return this.#isStaging$;
  }

  @cache()
  get states$(): Observable<ReadonlySet<ObjectSpec<PieceSpec>>> {
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
    return $objectService.get(this.vine).pipe(
        switchMap(renderableService => renderableService.objectIds$),
        tap(objectIds => {
          const id = this.idGenerator.generate(objectIds);
          const state = {
            type: objectType,
            id,
            payload: pieceSpec,
          };
          const states = this.#states$.getValue();
          this.#states$.next(new Set([...states, state]));
        }),
        take(1),
    );
  }

  private init(): void {
    registerObjectCreateSpec<PieceSpec>(
        DEMO_PREVIEW_TYPE,
        (state, context) => {
          const icon$list = state.payload.icons.map((icon, index) => renderCustomElement(
              $icon,
              {
                inputs: {icon: observableOf(icon)},
                attrs: new Map([
                  ['slot', observableOf(`face-${index}`)],
                ]),
              },
              context,
          ));

          return renderElement(
              state.payload.componentTag,
              {
                children: icon$list.length <= 0 ? observableOf([]) : combineLatest(icon$list),
                attrs: new Map([
                  [$baseComponent.api.objectId.attrName, observableOf(state.id)],
                ]),
              },
              context,
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
