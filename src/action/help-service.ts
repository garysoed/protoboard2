import {source, Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {$window} from 'mask';
import {fromEvent, merge, Observable, Subject} from 'rxjs';
import {map, mapTo, shareReplay} from 'rxjs/operators';

import {TriggerSpec} from '../core/trigger-spec';


export const SHOW_HELP_EVENT = 'pb-show-help';


export interface ActionTrigger {
  readonly actionName: string;
  readonly trigger: TriggerSpec|null;
}

export interface HelpContent {
  readonly tag: string;
  readonly actions: readonly ActionTrigger[];
}

export class ShowHelpEvent extends Event {
  private readonly contents_: HelpContent[] = [];

  constructor() {
    super(SHOW_HELP_EVENT, {bubbles: true, composed: true});
  }

  add(content: HelpContent): void {
    this.contents_.push(content);
  }

  get contents(): readonly HelpContent[] {
    return this.contents_;
  }
}

export class HelpService {
  private readonly onClear$ = new Subject<void>();

  constructor(private readonly vine: Vine) { }

  @cache()
  get contents$(): Observable<readonly HelpContent[]> {
    const event$ = fromEvent<ShowHelpEvent>($window.get(this.vine), SHOW_HELP_EVENT).pipe(
        map(event => event.contents),
    );
    const onClear$ = this.onClear$.pipe(mapTo([]));
    return merge(event$, onClear$).pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  hide(): void {
    this.onClear$.next();
  }
}

export const $helpService = source(vine => new HelpService(vine));
