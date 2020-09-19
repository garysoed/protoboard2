import { source, Vine } from 'grapevine';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { Snapshot } from 'gs-tools/export/state';
import { EditableStorage } from 'gs-tools/export/store';
import { $stateService } from 'mask';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { $objectSpecListId } from '../../objects/object-spec-list';


const ID = 'save';

export class SaveService {
  private readonly isSaving$ = new BehaviorSubject(false);

  constructor(private readonly vine: Vine) { }

  run(): Observable<unknown> {
    return this.isSaving$.pipe(
        withLatestFrom($stateService.get(this.vine), $objectSpecListId.get(this.vine)),
        switchMap(([isSaving, stateService, objectSpecListId]) => {
          if (!isSaving || !objectSpecListId) {
            return EMPTY;
          }

          return stateService.onChange$.pipe(map(() => stateService.snapshot(objectSpecListId)));
        }),
        withLatestFrom($saveStorage.get(this.vine)),
        switchMap(([snapshot, storage]) => {
          if (!storage) {
            return EMPTY;
          }

          return storage.update(ID, snapshot);
        }),
    );
  }

  get savedState$(): Observable<Snapshot<unknown>|null> {
    return $saveStorage.get(this.vine).pipe(
        filterNonNull(),
        switchMap(storage => storage.read(ID)),
    );
  }

  setSaving(isSaving: boolean): void {
    this.isSaving$.next(isSaving);
  }
}

export const $saveStorage = source<EditableStorage<Snapshot<any>>|null>('saveStorage', () => null);
export const $saveService = source('SaveService', vine => new SaveService(vine));
