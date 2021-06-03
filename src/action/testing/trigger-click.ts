export function triggerClick(targetEl: Element): void {
  targetEl.dispatchEvent(new MouseEvent('click'));
}