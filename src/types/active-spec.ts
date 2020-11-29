import {IsContainer} from '../payload/is-container';

import {ObjectClass, ObjectSpec} from './object-spec';


export interface ActiveSpec extends ObjectSpec<IsContainer<'indexed'>> {
  readonly objectClass: ObjectClass.ACTIVE;
}