import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {BehaviorSubject} from 'rxjs';

type GetRenderSpecFn = (id: unknown) => RenderSpec;
export const $getRenderSpec$ = source(() => new BehaviorSubject<GetRenderSpecFn|null>(null));