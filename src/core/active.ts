import {$asArray, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {instanceofType} from 'gs-types';
import {$stateService, _p} from 'mask';
import {classToggle, element, host, multi, NodeWithId, PersonaContext, renderCustomElement, style, textContent} from 'persona';
import {fromEvent, Observable, of as observableOf} from 'rxjs';
import {map, share, switchMap, throttleTime, withLatestFrom} from 'rxjs/operators';

import {$baseComponent, BaseComponent} from '../core/base-component';
import {renderContents} from '../render/render-contents';
import {ActiveSpec} from '../types/active-spec';
import {ObjectSpec} from '../types/object-spec';

import template from './active.html';


const COUNT_THRESHOLD = 3;

export const ACTIVE_TYPE = 'pb.active';

/**
 * The active object API.
 *
 * @thModule region
 */
export const $active = {
  tag: 'pb-active',
  api: {
    // TODO: Should not require object-id
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
export class Active extends BaseComponent<ActiveSpec, typeof $> {
  constructor(context: PersonaContext) {
    super([], context, $);

    this.addSetup(renderContents(this.objectSpec$, $.root._.content, context));
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.count.text(this.itemCount$),
      this.renderers.root.classMultiple(this.multipleItems$),
      this.renderers.root.left(this.left$),
      this.renderers.root.top(this.top$),
    ];
  }

  @cache()
  private get contentIds$(): Observable<ReadonlyArray<StateId<ObjectSpec<any>>>> {
    return this.objectSpec$.pipe(
        withLatestFrom($stateService.get(this.vine)),
        switchMap(([spec, stateService]) => {
          if (!spec) {
            return observableOf(null);
          }

          return stateService.get(spec.payload.$contentSpecs);
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
  private get mouseEvent$(): Observable<{readonly event: MouseEvent, readonly rect: Rect}> {
    return fromEvent<MouseEvent>(window, 'mousemove')
        .pipe(
            throttleTime(10),
            map(event => ({
              event,
              rect: computeAllRects($.root.getSelectable(this.context)),
            })),
            share(),
        );
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
    objectId: StateId<ActiveSpec>,
    context: PersonaContext,
): Observable<NodeWithId<Element>> {
  return renderCustomElement(
      $active,
      {inputs: {objectId: observableOf(objectId)}},
      {},
      context,
  );
}
