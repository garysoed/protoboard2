import {Context} from 'persona';
import {OperatorFunction} from 'rxjs';

import {BaseComponentSpecType} from '../core/base-component';
import {ComponentState} from '../types/component-state';


export type Action<S extends ComponentState, C> = (
    context: Context<BaseComponentSpecType<S>>,
    config: C,
) => OperatorFunction<unknown, unknown>;