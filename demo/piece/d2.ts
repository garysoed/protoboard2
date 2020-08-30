import { cache } from 'gs-tools/export/data';
import { _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { $d2, D2 } from '../../src/piece/d2';
import { $stagingService } from '../core/staging-service';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

import template from './d2.html';


export const $d2Demo = {
  tag: 'pbd-d2',
  api: {},
};

const $ = {
  template: element('template', $pieceTemplate, {}),
};

@_p.customElement({
  ...$d2Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D2,
  ],
  template,
})
export class D2Demo extends ThemedCustomElementCtrl {
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
                componentTag: $d2.tag,
                icons,
              },
          );
        }),
    );
  }
}
