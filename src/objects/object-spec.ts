/**
 * State of a game during its runtime.
 *
 * @thModule core
 */
export interface ObjectSpec<P> {
  /**
   * Identifies the object. Must be globally unique.
   */
  readonly id: string;

  /**
   * Type of the object. Identifies how to render the object.
   */
  readonly type: string;

  /**
   * Used to generate the object.
   */
  readonly payload: P;
}
