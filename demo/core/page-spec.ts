import {enumType, hasPropertiesType, instanceofType, stringType} from 'gs-types';
import {CustomElementRegistration} from 'persona';

import {D1_DEMO} from '../piece/d1';
import {D2_DEMO} from '../piece/d2';
import {D6_DEMO} from '../piece/d6';
import {DECK_DEMO} from '../region/deck';
import {PAD_DEMO} from '../region/pad';
import {SURFACE_DEMO} from '../region/surface';

import {INSTRUCTION} from './instruction';
import {Views} from './location-service';


export interface PageSpec {
  readonly label: string;
  readonly path: Views;
  readonly registration: CustomElementRegistration<HTMLElement, any>;
}

export const PAGE_SPEC_TYPE = hasPropertiesType({
  label: stringType,
  path: enumType<Views>(Views),
  registration: instanceofType<CustomElementRegistration<HTMLElement, any>>(HTMLElement),
});

export const CONTAINER_LINK_CONFIGS: readonly PageSpec[] = [
  {label: 'Deck', path: Views.DECK, registration: DECK_DEMO},
  {label: 'Pad', path: Views.PAD, registration: PAD_DEMO},
  {label: 'Surface', path: Views.SURFACE, registration: SURFACE_DEMO},
];

export const LAYOUT_LINK_CONFIGS: readonly PageSpec[] = [
  // {label: 'Free', path: Views.FREE_LAYOUT},
  // {label: 'Grid', path: Views.GRID_LAYOUT},
];

export const PIECE_LINK_CONFIGS: readonly PageSpec[] = [
  {label: 'D1', path: Views.D1, registration: D1_DEMO},
  {label: 'D2', path: Views.D2, registration: D2_DEMO},
  {label: 'D6', path: Views.D6, registration: D6_DEMO},
];

export const ALL_SPECS: readonly PageSpec[] = [
  ...CONTAINER_LINK_CONFIGS,
  ...LAYOUT_LINK_CONFIGS,
  ...PIECE_LINK_CONFIGS,
  {label: 'Instruction', path: Views.INSTRUCTION, registration: INSTRUCTION},
];

export function getPageSpec(view: Views): PageSpec|null {
  return ALL_SPECS.find(({path}) => path === view) ?? null;
}