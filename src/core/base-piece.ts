import { _p, ThemedCustomElementCtrl } from '@mask';
import { InitFn } from '@persona';
import { BaseAction } from './base-action';

@_p.baseCustomElement({})
export class BasePiece extends ThemedCustomElementCtrl {
  constructor(
      private readonly actions: Iterable<BaseAction>,
      shadowRoot: ShadowRoot,
  ) {
    super(shadowRoot);
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      ...[...this.actions].map(action => action.install()),
    ];
  }
}
