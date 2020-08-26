import { BehaviorSubject } from 'rxjs';

/**
 * State of a game during its runtime.
 *
 * @thModule core
 */
export interface State<P extends object> {
  /**
   * Identifies the object. Must be globally unique.
   */
  readonly id: string;

  /**
   * Used to map to a function that generates the object.
   */
  readonly type: string;

  /**
   * Used to generate the object.
   * TODO: Instead of BehaviorSubject, this should be split into Observable and Subject/
   */
  readonly payload: {readonly [K in keyof P]: BehaviorSubject<P[K]>};
}
