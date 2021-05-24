import {$stateService} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$div, classToggle, element, host, multi, PersonaContext, renderCustomElement, RenderSpec, style, textContent} from 'persona';
import {fromEvent, Observable, of as observableOf} from 'rxjs';
import {map, share, throttleTime} from 'rxjs/operators';

import {$baseComponent, BaseComponent} from '../core/base-component';
import {ContentSpec, IsContainer} from '../payload/is-container';
import {renderContents} from '../render/render-contents';

import {$$activeSpec} from './active-spec';
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
  count: element('count', $div, {
    text: textContent(),
  }),
  root: element('root', $div, {
    classMultiple: classToggle('multiple'),
    content: multi('#content'),
    left: style('left'),
    top: style('top'),
  }),
};

export type ActiveSpec = IsContainer<'indexed'>;

interface Input {
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<'indexed'>>>,
}

export function activeSpec(input: Input): ActiveSpec {
  return {
    containerType: 'indexed',
    $contentSpecs: input.$contentSpecs,
  };
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
})
export class Active extends BaseComponent<ActiveSpec, typeof $> {
  constructor(context: PersonaContext) {
    super([], context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.count.text(this.itemCountDisplay$),
      this.renderers.root.classMultiple(this.multipleItems$),
      this.renderers.root.left(this.left$),
      this.renderers.root.top(this.top$),
      this.renderers.root.content(renderContents($$activeSpec.get(this.vine), this.vine)),
    ];
  }

  @cache()
  private get itemCount$(): Observable<number> {
    return $stateService.get(this.vine).resolve($$activeSpec.get(this.vine)).$('$contentSpecs').pipe(
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
            map(event => ({
              event,
              rect: computeAllRects($.root.getSelectable(this.context)),
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
): Observable<RenderSpec> {
  return observableOf(renderCustomElement({
    spec: $active,
    inputs: {objectId},
    id: {},
  }));
}
