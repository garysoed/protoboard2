import { stream } from 'grapevine';
import { ArrayDiff, ArraySubject } from 'gs-tools/export/rxjs';
import { _v } from 'mask';
import { Observable, of as observableOf } from 'rxjs';

export class PickService {
  private readonly components$ = new ArraySubject<Element>();

  add(el: Element): void {
    this.components$.insert(el);
  }

  deleteAt(index: number): void {
    this.components$.deleteAt(index);
  }

  getComponents(): Observable<ArrayDiff<Element>> {
    return this.components$;
  }
}

export const $pickService = stream(() => observableOf(new PickService()), globalThis);
