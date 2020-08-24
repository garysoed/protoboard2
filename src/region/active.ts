import { $asArray, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, classToggle, element, host, listParser, multi, PersonaContext, renderCustomElement, stringParser, style, textContent } from 'persona';
import { combineLatest, fromEvent, Observable, of as observableOf } from 'rxjs';
import { map, share, switchMap, withLatestFrom } from 'rxjs/operators';

import { registerStateHandler } from '../state/register-state-handler';
import { SavedState } from '../state/saved-state';
import { $stateService } from '../state/state-service';

import template from './active.html';


/**
 * Type of the active region.
 *
 * @thModule region
 */
export const ACTIVE_TYPE = 'pb.active';

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
    objectIds: attributeIn('object-ids', listParser(stringParser()), []),
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
export interface ActivePayload {
  /**
   * ID of objects that are active.
   */
  readonly objectIds: readonly string[];
}

/**
 * Creates active state with the given objectIds active.
 * @param objectIds - IDs in the active region.
 *
 * @thModule region
 */
export function createActiveState(objectIds: readonly string[]): SavedState {
  return {id: ACTIVE_ID, type: ACTIVE_TYPE, payload: {objectIds}};
}

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
  configure: vine => {
    registerStateHandler<ActivePayload>(
        ACTIVE_TYPE,
        (state, context) => {
          return renderCustomElement(
              $active,
              {inputs: {objectIds: state.payload.objectIds}},
              context,
          );
        },
        vine,
    );
  },
})
export class Active extends ThemedCustomElementCtrl {
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
    super(context);

    this.render($.count._.text, this.itemCount$);
    this.render($.root._.classMultiple, this.multipleItems$);
    this.render($.root._.content, this.content$);
    this.render($.root._.left, this.left$);
    this.render($.root._.top, this.top$);
  }

  @cache()
  private get content$(): Observable<readonly Node[]> {
    return this.declareInput($.host._.objectIds).pipe(
        withLatestFrom($stateService.get(this.vine)),
        switchMap(([itemIds, stateService]) => {
          const node$list = $pipe(
              itemIds,
              $map(id => stateService.getObject(id, this.context)),
              $filterNonNull(),
              $asArray(),
          );

          return node$list.length <= 0 ? observableOf([]) : combineLatest(node$list);
        }),
    );
  }

  @cache()
  private get itemCount$(): Observable<string> {
    return this.declareInput($.host._.objectIds).pipe(
        map(ids => ids.length > 1 ? `${ids.length}` : ''),
    );
  }

  @cache()
  private get left$(): Observable<string> {
    return this.mouseEvent$.pipe(map(({event, rect}) => `${event.x - rect.width / 2}px`));
  }

  @cache()
  private get multipleItems$(): Observable<boolean> {
    return this.declareInput($.host._.objectIds).pipe(map(ids => ids.length > 1));
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
