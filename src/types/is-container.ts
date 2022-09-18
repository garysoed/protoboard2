import {hasPropertiesType, instanceofType} from 'gs-types';
import {Subject} from 'rxjs';

import {ComponentId} from '../id/component-id';

export interface IsContainer {
  readonly contentIds: Subject<readonly ComponentId[]>;
}

export const IS_CONTAINER_TYPE = hasPropertiesType({
  contentIds: instanceofType<Subject<readonly ComponentId[]>>(Subject),
});