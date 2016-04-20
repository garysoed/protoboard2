/**
 * Interface for all components that can handle actions.
 */
interface IActionHandler {
  /**
   * Handles the action corresponding to the given key.
   * @param key Key pressed by the user.
   */
  handleAction(key: string): void;
}

export default IActionHandler;
