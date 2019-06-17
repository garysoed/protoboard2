import { ArrayDiff, ArraySubject } from '@gs-tools/rxjs';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';

export class PickService {
  private readonly elements$ = new ArraySubject<Element>();

  add(el: Element): void {
    this.elements$.insert(el);
  }

  getElements(): Observable<ArrayDiff<Element>> {
    return this.elements$.getDiffs();
  }
}

export const $pickService = _v.stream(() => observableOf(new PickService()), globalThis);
