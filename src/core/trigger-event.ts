export interface TriggerEvent {
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly mouseX: number;
  readonly mouseY: number;
  readonly targetEl: Element;
}