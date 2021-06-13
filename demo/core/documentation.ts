import {cache} from 'gs-tools/export/data';
import {assertUnreachable} from 'gs-tools/export/typescript';
import {BaseThemedCtrl, _p} from 'mask';
import {$div, element, PersonaContext, renderCustomElement, RenderSpec, single} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$canvasDemo, CanvasDemo} from '../piece/canvas';
import {$d1Demo, D1Demo} from '../piece/d1';
import {$d2Demo, D2Demo} from '../piece/d2';
import {$d6Demo, D6Demo} from '../piece/d6';
import {$deckDemo, DeckDemo} from '../region/deck';
import {$slotDemo, SlotDemo} from '../region/slot';

import template from './documentation.html';
import {$instruction, Instruction} from './instruction';
import {$locationService, Views} from './location-service';


const $documentation = {
  tag: 'pbd-documentation',
  api: {},
};

const $ = {
  root: element('root', $div, {
    content: single('#content'),
  }),
};

@_p.customElement({
  ...$documentation,
  dependencies: [
    CanvasDemo,
    D1Demo,
    D2Demo,
    D6Demo,
    DeckDemo,
    Instruction,
    SlotDemo,
  ],
  template,
})
export class Documentation extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.content(this.content$),
    ];
  }

  @cache()
  private get content$(): Observable<RenderSpec|null> {
    return $locationService.get(this.vine).location$
        .pipe(
            map(location => {
              switch (location.type) {
                case Views.CANVAS:
                  return $canvasDemo;
                case Views.D1:
                  return $d1Demo;
                case Views.D2:
                  return $d2Demo;
                case Views.D6:
                  return $d6Demo;
                case Views.DECK:
                  return $deckDemo;
                case Views.INSTRUCTION:
                  return $instruction;
                case Views.SLOT:
                  return $slotDemo;
                default:
                  assertUnreachable(location.type);
              }
            }),
            map(spec => renderCustomElement({spec, id: {}})),
        );
  }
}
