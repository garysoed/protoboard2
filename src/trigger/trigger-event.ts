export interface TriggerDetails {
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly mouseClientX: number;
  readonly mouseClientY: number;
  readonly eventType: 'click'|'key';
  readonly key: string|null;
}

export const TRIGGER_EVENT = 'pb-trigger';

export class TriggerEvent extends Event {
  constructor(
      readonly details: TriggerDetails,
  ) {
    super(TRIGGER_EVENT, {bubbles: true, composed: true});
  }
}