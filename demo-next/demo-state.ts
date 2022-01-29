import {$stateService, source} from 'grapevine';


export interface DemoState {
}

export const $state$ = source(vine => $stateService.get(vine).addRoot<DemoState>({})._());