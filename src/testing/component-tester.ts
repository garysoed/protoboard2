export function configure(el: HTMLElement, actionKey: string, configs: Map<string, string>): void {
  const configEl = getConfigEl(el, actionKey);
  for (const [key, value] of configs) {
    configEl.setAttribute(key, value);
  }

  el.appendChild(configEl);
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
