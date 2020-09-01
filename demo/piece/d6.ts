import { cache } from 'gs-tools/export/data';
import { _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { $d6, D6 } from '../../src/piece/d6';
import { $stagingService } from '../core/staging-service';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

import template from './d6.html';


export const $d6Demo = {
  tag: 'pbd-d6',
  api: {},
};

const $ = {
  template: element('template', $pieceTemplate, {}),
};

@_p.customElement({
  ...$d6Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D6,
  ],
  template,
})
export class D6Demo extends ThemedCustomElementCtrl {
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
                componentTag: $d6.tag,
                icons,
              },
          );
        }),
    );
  }
}
