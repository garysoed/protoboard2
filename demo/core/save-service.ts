import { source, Vine } from 'grapevine';
import { Snapshot } from 'gs-tools/export/state';
import { LocalStorage } from 'gs-tools/export/store';
import { $stateService } from 'mask';
import { identity, json } from 'nabu';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { $objectSpecListId } from '../../src/state-old/object-spec-list';


const ID = 'save';

// TODO: MOVE TO mask
export class SaveService {
  private readonly isSaving$ = new BehaviorSubject(false);
  private readonly storage = new LocalStorage<Snapshot<any>>(
      this.window,
      'pbd',
      // TODO: Make this easier.
      identity() as any,
      json(),
  );

  constructor(
      private readonly vine: Vine,
      private readonly window: Window,
  ) { }

  run(): Observable<unknown> {
    return this.isSaving$.pipe(
        withLatestFrom($stateService.get(this.vine), $objectSpecListId.get(this.vine)),
        switchMap(([isSaving, stateService, objectSpecListId]) => {
          if (!isSaving || !objectSpecListId) {
            return EMPTY;
          }

          return stateService.onChange$.pipe(map(() => stateService.snapshot(objectSpecListId)));
        }),
        switchMap(snapshot => this.storage.update(ID, snapshot)),
    );
  }

  get savedState$(): Observable<Snapshot<unknown>|null> {
    return this.storage.read(ID);
  }

  setSaving(isSaving: boolean): void {
    this.isSaving$.next(isSaving);
  }
}

export const $saveService = source('SaveService', vine => new SaveService(vine, window));
