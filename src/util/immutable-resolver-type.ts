import {ImmutableResolver} from 'gs-tools/export/state';
import {instanceofType, Type} from 'gs-types';

export function immutableResolverType<InnerType = never>(): Type<ImmutableResolver<InnerType>> {
  return instanceofType<ImmutableResolver<InnerType>>(Object);
}