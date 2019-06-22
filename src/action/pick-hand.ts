import { assertUnreachable } from '@gs-tools/typescript';
import { InstanceofType } from '@gs-types';
import { _p, _v } from '@mask';
import { CustomElementCtrl, element, InitFn, style } from '@persona';
import { fromEvent, Observable } from '@rxjs';
import { map, share, switchMap, tap, withLatestFrom } from '@rxjs/operators';
import template from './pick-hand.html';
import { $pickService } from './pick-service';

interface Rect {
  height: number;
  width: number;
}

export const $ = {
  container: element('container', InstanceofType(HTMLDivElement), {
    left: style('left'),
    top: style('top'),
  }),
};

@_p.customElement({
  tag: 'pb-pick-hand',
  template,
})
export class PickHand extends CustomElementCtrl {
  private readonly container$ = _p.input($.container, this);
  private readonly mouseEvent$ = fromEvent<MouseEvent>(window, 'mousemove')
      .pipe(
          withLatestFrom(this.container$),
          map(([event, containerEl]) => ({
            event,
            rect: computeAllRects(containerEl),
          })),
          share(),
      );

  getInitFunctions(): InitFn[] {
    return [
      this.renderContentElements(),
      _p.render($.container._.left).withVine(_v.stream(this.renderLeft, this)),
      _p.render($.container._.top).withVine(_v.stream(this.renderTop, this)),
    ];
  }

  private renderContentElements(): InitFn {
    return vine => {
      return $pickService.get(vine)
          .pipe(
              switchMap(service => service.getElements()),
              withLatestFrom(this.container$),
              tap(([diff, container]) => {
                switch (diff.type) {
                  case 'add':
                    container.appendChild(diff.value);
                    break;
                  case 'delete':
                    container.removeChild(diff.value);
                    break;
                  case 'init':
                    while (container.childElementCount > 0) {
                      const toDelete = container.firstElementChild;
                      if (!toDelete) {
                        break;
                      }
                      container.removeChild(toDelete);
                    }

                    for (const el of diff.value) {
                      container.appendChild(el);
                    }
                    break;
                  default:
                    assertUnreachable(diff);
                }
              }),
          );
    };
  }

  private renderLeft(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.x - rect.width / 2}px`));
  }

  private renderTop(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.y - rect.height / 2}px`));
  }
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