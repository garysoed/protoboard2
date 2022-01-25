import {TriggerSpec} from '../types/trigger-spec';


export interface ActionTrigger {
  readonly actionName: string;
  readonly trigger: TriggerSpec|null;
}

export interface HelpContent {
  readonly actions: readonly ActionTrigger[];
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
