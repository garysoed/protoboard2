import { ArrayDiff } from '@gs-tools/rxjs';
import { InstanceofType } from '@gs-types';
import { _p, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, repeated, RepeatedSpec } from '@persona';
import template from './drawer.html';

const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    contents: repeated('#contents', 'mk-text-icon-button'),
  }),
};

interface LinkConfig {
  label: string;
  path: string;
}

const linkConfig: LinkConfig[] = [
  {label: 'Piece', path: './piece'},
];

@_p.customElement({
  dependencies: [
    TextIconButton,
  ],
  tag: 'pbd-drawer',
  template,
})
export class Drawer extends ThemedCustomElementCtrl {
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.root._.contents).withValue(createRepeatedSpecs(linkConfig)),
    ];
  }
}

function createRepeatedSpecs(linkConfig: LinkConfig[]): ArrayDiff<RepeatedSpec> {
  const specs: RepeatedSpec[] = linkConfig.map(({label, path}) => {
    return {
      attr: new Map([['label', label], ['path', path]]),
    };
  });

  return {
    type: 'init',
    value: specs,
  };
}
