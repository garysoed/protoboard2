import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {renderTheme} from 'mask';
import {Context, Ctrl, DIV, query, itarget, oclass, oforeach, ostyle, otext, registerCustomElement} from 'persona';
import {fromEvent, Observable} from 'rxjs';
import {map, share, throttleTime, withLatestFrom} from 'rxjs/operators';

import {renderComponent} from '../render/render-component';

import {$activeState} from './active-spec';
import template from './active.html';


const COUNT_THRESHOLD = 3;


export const $active = {
  shadow: {
    count: query('#count', DIV, {
      classMultiple: oclass('multiple'),
      textContent: otext(),
    }),
    root: query('#root', DIV, {
      content: oforeach('#content', instanceofType(Object)),
      element: itarget(),
      left: ostyle('left'),
      top: ostyle('top'),
    }),
  },
};


/**
 * Represents a region containing objects that are actively manipulated.
 *
 * @remarks
 * The closest real world analogy is the player's hand while they're manipulating an object.
 *
 * @thModule region
 */
export class Active implements Ctrl {
  constructor(private readonly $: Context<typeof $active>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.itemCountDisplay$.pipe(this.$.shadow.count.textContent()),
      this.multipleItems$.pipe(this.$.shadow.count.classMultiple()),
      this.left$.pipe(this.$.shadow.root.left()),
      this.top$.pipe(this.$.shadow.root.top()),
      $activeState.get(this.$.vine).$('contentIds').pipe(
          map(specs => specs.slice(0, COUNT_THRESHOLD)),
          this.$.shadow.root.content(componentId => renderComponent(this.$.vine, componentId)),
      ),
    ];
  }

  @cache()
  private get itemCount$(): Observable<number> {
    return $activeState.get(this.$.vine).$('contentIds').pipe(
        map(ids => (ids?.length) ?? 0),
    );
  }

  @cache()
  private get itemCountDisplay$(): Observable<string> {
    return this.itemCount$.pipe(
        map(count => count > COUNT_THRESHOLD ? `+${count - COUNT_THRESHOLD}` : ''),
    );
  }

  @cache()
  private get left$(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.x - rect.width / 2}px`));
  }

  @cache()
  private get mouseEvent$(): Observable<{readonly event: MouseEvent, readonly rect: Rect}> {
    return fromEvent<MouseEvent>(window, 'mousemove')
        .pipe(
            throttleTime(10),
            withLatestFrom(this.$.shadow.root.element),
            map(([event, element]) => ({
              event,
              rect: computeAllRects(element),
            })),
            share(),
        );
  }

  @cache()
  private get multipleItems$(): Observable<boolean> {
    return this.itemCount$.pipe(map(count => count > COUNT_THRESHOLD));
  }

  @cache()
  private get top$(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.y - rect.height / 2}px`));
  }
}

export const ACTIVE = registerCustomElement({
  ctrl: Active,
  spec: $active,
  tag: 'pb-active',
  template,
});


interface Rect {
  readonly height: number;
  readonly width: number;
}

const __rect = Symbol('rect');
interface ElementWithRect extends Element {
  [__rect]?: Rect;
}

function computeAllRects(container: Element): Rect {
  let width = 0;
  let height = 0;

  for (let i = 0; i < container.childElementCount; i++) {
    const child = container.children.item(i);
    if (!child) {
      continue;
    }

    const rect = computeRect(child);
    height = Math.max(rect.height, height);
    width = Math.max(rect.width, width);
  }

  return {height, width};
}

function computeRect(element: ElementWithRect): Rect {
  const rect = element[__rect] || element.getBoundingClientRect();
  element[__rect] = rect;

  return rect;
}

