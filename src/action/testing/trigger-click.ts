interface TriggerSpec {
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly shiftKey?: boolean;
  readonly mouseX?: number;
  readonly mouseY?: number;
}

export function triggerClick(targetEl: Element, triggerSpec: TriggerSpec = {}): void {
  targetEl.dispatchEvent(Object.assign(
      new CustomEvent('click'),
      {
        ...triggerSpec,
        offsetX: triggerSpec.mouseX ?? 12,
        offsetY: triggerSpec.mouseY ?? 34,
      },
  ));
}