import {Context} from 'persona';
import {OperatorFunction, Observable} from 'rxjs';

import {BaseComponentSpecType} from '../core/base-component';
import {TriggerEvent} from '../trigger/trigger-event';
import {ComponentState} from '../types/component-state';


export type Action<S extends ComponentState, C, I> = (
    context: Context<BaseComponentSpecType<S>>,
    config: Observable<C>,
) => OperatorFunction<TriggerEvent|I, TriggerEvent|I>;