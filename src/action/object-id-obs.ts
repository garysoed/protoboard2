import {StateId} from 'gs-tools/export/state';
import {Observable} from 'rxjs';

export type ObjectIdObs<T> = Observable<StateId<T>|undefined>;