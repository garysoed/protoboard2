export enum ObjectClass {
  PIECE = 0,
  CONTAINER = 1,
  ACTIVE = 2,
}

/**
 * State of a game during its runtime.
 *
 * @thModule core
 */
export interface ObjectSpec<P> {
  /**
   * Class of the object.
   */
  readonly objectClass: ObjectClass;

  /**
   * Type of the object. Identifies how to render the object.
   */
  readonly type: string;

  /**
   * Used to generate the object.
   */
  readonly payload: P;
}
