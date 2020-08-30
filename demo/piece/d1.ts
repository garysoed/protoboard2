import { cache } from 'gs-tools/export/data';
import { elementWithTagType } from 'gs-types';
import { _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { $d1, D1 } from '../../src/piece/d1';
import { $stagingService } from '../core/staging-service';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

import template from './d1.html';


export const $d1Demo = {
  tag: 'pbd-d1',
  api: {},
};

const $ = {
  create: element('create', elementWithTagType('section'), {}),
  template: element('template', $pieceTemplate, {}),
};


@_p.customElement({
  ...$d1Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D1,
  ],
  template,
})
export class D1Demo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.handleOnPieceAdd$);
  }

  @cache()
  private get handleOnPieceAdd$(): Observable<unknown> {
    return this.declareInput($.template._.onAdd).pipe(
        withLatestFrom($stagingService.get(this.vine)),
        switchMap(([{icons}, stagingService]) => {
          return stagingService.addPiece(
              {
                componentTag: $d1.tag,
                icons,
              },
          );
        }),
    );
  }
}
