import {hasPropertiesType, nullableType, stringType} from 'gs-types';

import {TriggerSpec, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';


export interface ActionTrigger {
  readonly actionName: string;
  readonly trigger: TriggerSpec|null;
}

export const ACTION_TRIGGER_TYPE = hasPropertiesType({
  actionName: stringType,
  trigger: nullableType(TRIGGER_SPEC_TYPE),
});

export interface HelpContent {
  readonly actions: readonly ActionTrigger[];
  readonly componentName: string;
}

export const SHOW_HELP_EVENT = 'pb-show-help';

export class ShowHelpEvent extends Event {
  private readonly contentsInternal: HelpContent[] = [...this.contentsInit];
  constructor(private readonly contentsInit: readonly HelpContent[]) {
    super(SHOW_HELP_EVENT, {bubbles: true, composed: true});
  }

  addContent(newContent: HelpContent): void {
    this.contentsInternal.push(newContent);
  }

  get contents(): readonly HelpContent[] {
    return this.contentsInternal;
  }
}
