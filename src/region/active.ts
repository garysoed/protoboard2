import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { classToggle, element, host, multi, PersonaContext, renderCustomElement, style, textContent } from 'persona';
import { fromEvent, Observable, of as observableOf } from 'rxjs';
import { map, share, switchMap, withLatestFrom } from 'rxjs/operators';

import { IsContainer } from '../action/payload/is-container';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { ObjectSpec } from '../objects/object-spec';
import { renderContents } from '../render/render-contents';

import template from './active.html';


/**
 * ID of the object representing the active region.
 *
 * @thModule region
 */
export const ACTIVE_ID = 'pb.active';

/**
 * The active object API.
 *
 * @thModule region
 */
export const $active = {
  tag: 'pb-active',
  api: {
    ...$baseComponent.api,
  },
};

export const $ = {
  host: host($active.api),
  count: element('count', instanceofType(HTMLDivElement), {
    text: textContent(),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    classMultiple: classToggle('multiple'),
    content: multi('#content'),
    left: style('left'),
    top: style('top'),
  }),
};

/**
 * Payload of the active region.
 *
 * @thModule region
 */
// tslint:disable-next-line: no-empty-interface
export interface ActivePayload extends IsContainer { }

/**
 * Represents a region containing objects that are actively manipulated.
 *
 * @remarks
 * The closest real world analogy is the player's hand while they're manipulating an object.
 *
 * @thModule region
 */
@_p.customElement({
  ...$active,
  template,
})
export class Active extends BaseComponent<ActivePayload> {
  private readonly mouseEvent$ = fromEvent<MouseEvent>(window, 'mousemove')
      .pipe(
          withLatestFrom(this.declareInput($.root)),
          map(([event, containerEl]) => ({
            event,
            rect: computeAllRects(containerEl),
          })),
          share(),
      );

  constructor(context: PersonaContext) {
    super(new Map(), context, $.host);

    this.addSetup(renderContents(this.objectPayload$, $.root._.content, context));
    this.render($.count._.text, this.itemCount$);
    this.render($.root._.classMultiple, this.multipleItems$);
    this.render($.root._.left, this.left$);
    this.render($.root._.top, this.top$);
  }

  @cache()
  private get contentIds$(): Observable<readonly string[]> {
    return this.objectSpec$.pipe(
        switchMap(state => {
          // TODO
          // if (!state) {
            return observableOf([]);
          // }

          // return state.payload.contentIds;
        }),
    );
  }

  @cache()
  private get itemCount$(): Observable<string> {
    return this.contentIds$.pipe(
        map(ids => ids.length > 1 ? `${ids.length}` : ''),
    );
  }

  @cache()
  private get left$(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.x - rect.width / 2}px`));
  }

  @cache()
  private get multipleItems$(): Observable<boolean> {
    return this.contentIds$.pipe(map(ids => ids.length > 1));
  }

  @cache()
  private get top$(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.y - rect.height / 2}px`));
  }
}


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

export function renderActive(
    spec: ObjectSpec<ActivePayload>,
    context: PersonaContext,
): Observable<Node> {
  return renderCustomElement(
      $active,
      {inputs: {objectId: observableOf(spec.id)}},
      context,
  );
}
