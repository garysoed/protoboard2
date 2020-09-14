import { ObjectCreateSpec } from './object-create-spec';

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
   * Used to map to a function that generates the object.
   */
  readonly createSpec: ObjectCreateSpec<P>;

  /**
   * Used to generate the object.
   */
  readonly payload: P;
}
