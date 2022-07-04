set_vars({
  vars: {
    goldens: [
      'src-next/action/goldens',
      'src-next/core/goldens',
      'src-next/face/goldens',
      'src-next/pad/goldens',
      'src-next/piece/goldens',
      'src-next/region/goldens',
      'src-next/render/goldens',
    ],
  },
});

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
  as: parallel(({vars}) => ({
    cmds: [
      vars.webpackWatch,
      shell({
        bin: 'simpleserver',
        flags: [
          'demo-next/demo.conf.json',
        ],
      }),
    ],
  })),
});
