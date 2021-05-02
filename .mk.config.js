declare({
  name: 'link',
  as: single({
    bin: 'npm',
    flags: [
      'link',
      'gs-tools',
      'gs-testing',
      'gs-types',
      'grapevine',
      'dev',
      'persona',
      'mask',
      'moirai',
      'nabu',
      'santa',
      'devbase',
    ],
  }),
});

declare({
  name: 'demo',
  as: single({
    bin: 'simpleserver',
    flags: [
      'demo/demo.conf.json',
    ],
  }),
});
