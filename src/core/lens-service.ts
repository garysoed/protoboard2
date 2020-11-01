import { BehaviorSubject, Observable } from 'rxjs';
import { OrderedMap, ReadonlyOrderedMap } from 'gs-tools/export/collect';
import { map } from 'rxjs/operators';
import { source } from 'grapevine';

export class LensService {
  private readonly nodes$ =
      new BehaviorSubject<ReadonlyOrderedMap<unknown, DocumentFragment>>(new OrderedMap());

  get onNodes$(): Observable<DocumentFragment|null> {
    return this.nodes$.pipe(
        map(orderedMap => {
          const tuple = orderedMap.getAt(orderedMap.size - 1) || null;
          if (!tuple) {
            return null;
          }

          return tuple[1];
        }),
    );
  }

  hide(key: unknown): void {
    const currentNodes = this.nodes$.getValue();
    const newNodes = new OrderedMap([...currentNodes]);
    newNodes.delete(key);
    this.nodes$.next(newNodes);
  }

  show(key: unknown, nodes: DocumentFragment): void {
    const currentNodes = this.nodes$.getValue();
    const newNodes = new OrderedMap([...currentNodes]);
    newNodes.set(key, nodes);
    this.nodes$.next(newNodes);
  }
}


export const $lensService = source('LensService', () => new LensService());
