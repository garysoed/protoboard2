import {source, Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {$window} from 'mask';
import {fromEvent, merge, Observable, Subject} from 'rxjs';
import {map, mapTo, shareReplay, startWith} from 'rxjs/operators';

import {HelpContent, ShowHelpEvent, SHOW_HELP_EVENT} from './show-help-event';


export class HelpService {
  private readonly onClear$ = new Subject<void>();
  readonly contents$ = this.createContents();

  constructor(private readonly vine: Vine) { }

  @cache()
  private createContents(): Observable<readonly HelpContent[]> {
    const event$ = fromEvent<ShowHelpEvent>($window.get(this.vine), SHOW_HELP_EVENT).pipe(
        map(event => event.contents),
    );
    const onClear$ = this.onClear$.pipe(mapTo([]));
    return merge(event$, onClear$).pipe(
        startWith([]),
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }

  hide(): void {
    this.onClear$.next();
  }
}

export const $helpService = source(vine => new HelpService(vine));
