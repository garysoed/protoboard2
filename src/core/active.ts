import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { $stateService, _p } from 'mask';
import { NodeWithId, PersonaContext, classToggle, element, host, multi, renderCustomElement, style, textContent } from 'persona';
import { Observable, fromEvent, of as observableOf } from 'rxjs';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { map, share, switchMap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { $baseComponent, BaseComponent } from '../core/base-component';
import { IsContainer } from '../payload/is-container';
import { ObjectSpec } from '../objects/object-spec';
import { renderContents } from '../render/render-contents';

import template from './active.html';


const COUNT_THRESHOLD = 3;

/**
 * ID of the object representing the active region.
 *
 * @thModule region
 */
export const ACTIVE_ID = 'pb.active';

export const ACTIVE_TYPE = 'pb.active';

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
export type ActivePayload = IsContainer<'indexed'>

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
          throttleTime(10),
          map(event => ({
            event,
            rect: computeAllRects($.root.getSelectable(this.context)),
          })),
          share(),
      );

  constructor(context: PersonaContext) {
    super([], context);

    this.addSetup(renderContents(this.objectPayload$, $.root._.content, context));
    this.render($.count._.text, this.itemCount$);
    this.render($.root._.classMultiple, this.multipleItems$);
    this.render($.root._.left, this.left$);
    this.render($.root._.top, this.top$);
  }

  @cache()
  private get contentIds$(): Observable<readonly string[]> {
    return this.objectSpec$.pipe(
        withLatestFrom($stateService.get(this.vine)),
        switchMap(([state, stateService]) => {
          if (!state) {
            return observableOf(null);
          }

          return stateService.get(state.payload.$contentSpecs);
        }),
        map(ids => $pipe(
            ids ?? [],
            $map(spec => spec.objectId),
            $asArray(),
        )),
    );
  }

  @cache()
  private get itemCount$(): Observable<string> {
    return this.contentIds$.pipe(
        map(ids => ids.length > COUNT_THRESHOLD ? `+${ids.length - COUNT_THRESHOLD}` : ''),
    );
  }

  @cache()
  private get left$(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.x - rect.width / 2}px`));
  }

  @cache()
  private get multipleItems$(): Observable<boolean> {
    return this.contentIds$.pipe(map(ids => ids.length > COUNT_THRESHOLD));
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
): Observable<NodeWithId<Element>> {
  return renderCustomElement(
      $active,
      {inputs: {objectId: observableOf(spec.id)}},
      {},
      context,
  );
}
