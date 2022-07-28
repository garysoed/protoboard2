import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';


export function renderRotatable(): OperatorFunction<number|undefined, string> {
  return map(rotationDeg => `rotateZ(${rotationDeg ?? 0}deg)`);
}
