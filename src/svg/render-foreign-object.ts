import {ocase, query, renderString, FOREIGN_OBJECT, DIV, RenderSpec, ParseType} from 'persona';
import {ElementNamespace} from 'persona/export/internal';
import {Observable, OperatorFunction, of} from 'rxjs';
import {map} from 'rxjs/operators';

export interface RenderArgs {
  readonly rect$: Observable<SVGRectElement>;
  readonly renderContent: OperatorFunction<unknown, RenderSpec>;
}

export function renderForeignObject(args: RenderArgs): RenderSpec {
  return renderString({
    raw: of(`<foreignObject><div xmlns="${ElementNamespace.HTML}"></div></foreignObject>`),
    spec: {
      content: query('div', DIV, {
        content: ocase<{}>(),
      }),
      foreignObject: query(null, FOREIGN_OBJECT, {}),
    },
    runs: $foreign => [
      of({}).pipe($foreign.content.content(args.renderContent)),
      args.rect$.pipe(map(target => target.x.baseVal.value), $foreign.foreignObject.x()),
      args.rect$.pipe(map(target => target.y.baseVal.value), $foreign.foreignObject.y()),
      args.rect$.pipe(map(target => target.width.baseVal.value), $foreign.foreignObject.width()),
      args.rect$.pipe(map(target => target.height.baseVal.value), $foreign.foreignObject.height()),
    ],
    parseType: ParseType.SVG,
  });
}

