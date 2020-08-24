import { BehaviorSubject } from 'rxjs';

/**
 * State of a game during its runtime.
 *
 * @thModule core
 */
export interface State {
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
   * TODO: Remove the any
   */
  readonly payload: ReadonlyMap<string, BehaviorSubject<any>>;
}
