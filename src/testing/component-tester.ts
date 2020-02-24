import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TriggerSpec, TriggerType } from '../core/trigger-spec';

export function configure(el: HTMLElement, actionKey: string, configs: Map<string, string>): void {
  const configEl = getConfigEl(el, actionKey);
  for (const [key, value] of configs) {
    configEl.setAttribute(key, value);
  }

  el.appendChild(configEl);
}

export function trigger(el: HTMLElement): MonoTypeOperatorFunction<TriggerSpec> {
  return tap(spec => {
    switch (spec.type) {
      case TriggerType.KEY:
        el.dispatchEvent(new CustomEvent('mouseover'));
        window.dispatchEvent(new KeyboardEvent('keydown', {key: spec.key}));
        break;
      case TriggerType.CLICK:
        el.click();
        break;
    }
  });
}

function getConfigEl(el: HTMLElement, actionKey: string): HTMLElement {
  const configEl = el.querySelector(`pb-action-config[action="${actionKey}"]`);
  if (configEl instanceof HTMLElement) {
    return configEl;
  }

  const newConfigEl = document.createElement('pb-action-config');
  newConfigEl.setAttribute('action', actionKey);
  return newConfigEl;
}
