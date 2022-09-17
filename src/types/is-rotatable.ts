import {hasPropertiesType, instanceofType, Type} from 'gs-types';
import {Subject} from 'rxjs';

export interface IsRotatable {
  readonly rotationDeg: Subject<number>;
}

export const IS_ROTATABLE_TYPE: Type<IsRotatable> = hasPropertiesType({
  rotationDeg: instanceofType<Subject<number>>(Subject),
});
