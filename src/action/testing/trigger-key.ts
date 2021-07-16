interface TriggerSpec {
  readonly key: string;
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly shiftKey?: boolean;
  readonly mouseX?: number;
  readonly mouseY?: number;
}

export function triggerKey(targetEl: Element, triggerSpec: TriggerSpec): void {
  // Hover over the element.
  targetEl.dispatchEvent(new CustomEvent('mouseover'));
  targetEl.dispatchEvent(Object.assign(
      new CustomEvent('mousemove'),
      {
        ...triggerSpec,
        offsetX: triggerSpec.mouseX ?? 12,
        offsetY: triggerSpec.mouseY ?? 34,
      },
  ));

  // Press the key
  window.dispatchEvent(new KeyboardEvent('keydown', triggerSpec));
}