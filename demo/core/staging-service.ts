import { stream, Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { SimpleIdGenerator } from 'gs-tools/export/random';
import { $saveService, SaveService } from 'mask';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { $objectService } from '../../src/objects/object-service';

import { PieceSpec } from './piece-spec';


type PieceSpecNoId = {[K in Exclude<keyof PieceSpec, 'id'>]: PieceSpec[K]};

export class StagingService {
  readonly #isStaging$ = new BehaviorSubject(true);
  readonly #pieceSpecs$ = new BehaviorSubject<ReadonlySet<PieceSpec>>(new Set());
  private readonly idGenerator = new SimpleIdGenerator();

  get isStaging$(): Observable<boolean> {
    return this.#isStaging$;
  }

  @cache()
  get pieceSpecs$(): Observable<ReadonlySet<PieceSpec>> {
    return this.#pieceSpecs$;
  }

  constructor(
      private readonly saveService: SaveService,
      private readonly vine: Vine,
  ) {  }

  addPiece(pieceSpecNoId: PieceSpecNoId): Observable<unknown> {
    return $objectService.get(this.vine).pipe(
        switchMap(renderableService => renderableService.objectIds$),
        tap(objectIds => {
          const id = `object-${this.idGenerator.generate(objectIds)}`;
          const pieceSpec = {
            id,
            ...pieceSpecNoId,
          };
          const states = this.#pieceSpecs$.getValue();
          this.#pieceSpecs$.next(new Set([...states, pieceSpec]));
        }),
        take(1),
    );
  }

  clear(): void {
    this.#pieceSpecs$.next(new Set());
  }

  setStaging(staging: boolean): void {
    this.#isStaging$.next(staging);
    this.saveService.setSaving(!staging);
  }
}

export const $stagingService = stream(
    'StagingService',
    vine => $saveService.get(vine)
        .pipe(
            map(saveService => new StagingService(saveService, vine)),
        ),
);
