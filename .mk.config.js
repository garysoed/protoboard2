declare({
  name: 'link',
  as: shell({
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
  as: shell({
    bin: 'simpleserver',
    flags: [
      'demo/demo.conf.json',
    ],
  }),
});
