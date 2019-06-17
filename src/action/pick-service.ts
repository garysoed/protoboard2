import { SetDiff, SetSubject } from '@gs-tools/rxjs';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';

export class PickService {
  private readonly elements$ = new SetSubject<Element>();

  add(el: Element): void {
    this.elements$.add(el);
  }

  delete(el: Element): void {
    this.elements$.delete(el);
  }

  getElements(): Observable<SetDiff<Element>> {
    return this.elements$.getDiffs();
  }
}

export const $pickService = _v.stream(() => observableOf(new PickService()), globalThis);
