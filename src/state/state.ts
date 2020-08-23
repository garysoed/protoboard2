import { Observable } from 'rxjs';

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
   */
  readonly payload: ReadonlyMap<string, Observable<unknown>>;
}
