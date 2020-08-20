import { stream } from 'grapevine';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';

export class PickService {
  private readonly components$ = new BehaviorSubject<readonly Element[]>([]);

  add(el: Element): void {
    this.components$.next([...this.components$.getValue(), el]);
  }

  deleteAt(index: number): void {
    const elList = [...this.components$.getValue()];
    elList.splice(index, 1);
    this.components$.next(elList);
  }

  getComponents(): Observable<readonly Element[]> {
    return this.components$;
  }
}

export const $pickService = stream(() => observableOf(new PickService()), globalThis);
