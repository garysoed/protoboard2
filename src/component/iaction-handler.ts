import {IAction} from '../action/iaction';


/**
 * Interface for all components that can handle actions.
 */
export interface IActionHandler {
  addAction(action: IAction): void;

  /**
   * Handles the action corresponding to the given key.
   * @param key Key pressed by the user.
   */
  handleAction(key: string): void;
}
