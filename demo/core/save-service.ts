import { stream } from 'grapevine';
import { debug } from 'gs-tools/export/rxjs';
import { listConverter, mapConverter, objectConverter } from 'gs-tools/export/serializer';
import { LocalStorage } from 'gs-tools/export/store';
import { $window } from 'mask';
import { Converter, identity, json, Result, Serializable } from 'nabu';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { SavedState } from '../../src/state/saved-state';
import { $stateService, StateService } from '../../src/state/state-service';


const ID = 'save';

class StateConverter implements Converter<object, Serializable> {
  convertBackward(value: Serializable): Result<object> {
    if (typeof value !== 'object') {
      return {success: false};
    }

    const obj: Record<string, Serializable> = {};
    for (const key in value) {
      if (!value.hasOwnProperty(key)) {
        continue;
      }

      obj[key] = (value as any)[key];
    }
    return {success: true, result: obj};
  }

  convertForward(input: object): Result<Serializable> {
    const obj: Record<string, Serializable> = {};
    for (const key in input) {
      if (!input.hasOwnProperty(key)) {
        continue;
      }

      obj[key] = (input as any)[key];
    }
    return {success: true, result: obj};
  }
}

export class SaveService {
  private readonly storage = new LocalStorage<ReadonlyArray<SavedState<object>>>(
      this.window,
      'pbd',
      listConverter(
          objectConverter<SavedState<object>>({
            id: identity<string>(),
            type: identity<string>(),
            payload: new StateConverter(),
          }),
      ),
      json(),
  );

  constructor(
      private readonly stateService: StateService,
      private readonly window: Window,
  ) {
  }

  run(): Observable<unknown> {
    return this.stateService.currentState$.pipe(
        switchMap(state => this.storage.update(ID, [...state.values()])),
    );
  }

  get savedState$(): Observable<ReadonlyArray<SavedState<object>>|null> {
    return this.storage.read(ID);
  }
}

export const $saveService = stream(
    vine => combineLatest([
      $stateService.get(vine),
      $window.get(vine),
    ])
    .pipe(map(([stateService, window]) => new SaveService(stateService, window))),
    globalThis,
);
