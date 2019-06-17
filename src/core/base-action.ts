import { Vine } from '@grapevine';
import { Errors } from '@gs-tools/error';
import { element, InitFn, onDom } from '@persona';
import { BehaviorSubject, EMPTY, fromEvent, merge, Observable } from '@rxjs';
import { filter, map, mapTo, switchMap } from '@rxjs/operators';
import { TriggerSpec, TriggerType } from './trigger-spec';

const $ = {
  host: element({
    click: onDom('click'),
    mouseout: onDom('mouseout'),
    mouseover: onDom('mouseover'),
  }),
};

export abstract class BaseAction {
  private readonly triggerSpec$: BehaviorSubject<TriggerSpec>;

  constructor(defaultTriggerSpec: TriggerSpec) {
    this.triggerSpec$ = new BehaviorSubject(defaultTriggerSpec);
  }

  install(): InitFn {
    return (vine, root) => {
      const element = root.host;
      if (!(element instanceof HTMLElement)) {
        throw Errors.assert('element').shouldBeAnInstanceOf(HTMLElement).butWas(element);
      }

      return this.setupTrigger(root).pipe(switchMap(() => this.onTrigger(vine, root)));
    };
  }

  protected abstract onTrigger(vine: Vine, root: ShadowRoot): Observable<unknown>;

  private setupTrigger(root: ShadowRoot): Observable<unknown> {
    return this.triggerSpec$
        .pipe(
            switchMap(spec => {
              switch (spec.type) {
                case TriggerType.CLICK:
                  return this.setupTriggerClick(root);
                case TriggerType.KEY:
                  return this.setupTriggerKey(root, spec.key);
              }
            }),
        );
  }

  private setupTriggerClick(root: ShadowRoot): Observable<unknown> {
    return $.host._.click.getValue(root);
  }

  private setupTriggerKey(root: ShadowRoot, specKey: string): Observable<unknown> {
    return merge(
        $.host._.mouseout.getValue(root).pipe(mapTo(false)),
        $.host._.mouseover.getValue(root).pipe(mapTo(true)),
    )
    .pipe(
        switchMap(hovered => {
          return hovered ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
        }),
        map(event => event.key),
        filter(key => key === specKey),
    );
  }
}
