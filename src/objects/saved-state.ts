/**
 * State of a game that is saved.
 *
 * @thModule core
 */
export interface SavedState<P extends object> {
  /**
   * Identifies the object. Must be globally unique.
   */
  readonly id: string;

  /**
   * Used to map to a function that generates the object.
   */
  readonly type: string;

  /**
   * Used to initialize the state during the game.
   */
  readonly payload: P;
}
