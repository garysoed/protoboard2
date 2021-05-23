/**
 * State of a game during its runtime.
 *
 * @thModule core
 */
export interface ObjectSpec<P> {
  /**
   * Used to generate the object.
   */
  readonly payload: P;
}
