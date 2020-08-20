import { attributeIn, attributeOut, integerParser } from 'persona';

export const $face = {
  currentFaceIn: attributeIn('current-face', integerParser()),
  currentFaceOut: attributeOut('current-face', integerParser()),
};
