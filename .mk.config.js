set_vars({
  vars: {
    goldens: [
      'src/action/goldens',
      'src/core/goldens',
      'src/face/goldens',
      'src/piece/goldens',
      'src/region/goldens',
      'src/region/pad/goldens',
      'src/render/goldens',
      'src/svg/goldens',
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
  name: 'css',
  as: shell({
    bin: 'mask',
    flags: [
      '--base=amber',
      '--acc=lime',
      '--mode=dark',
      '--out=./demo-next/asset/theme.css',
    ]
  }),
})

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
