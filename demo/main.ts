import { Palette, start, SvgConfig, Theme } from '@mask';

const iconConfigs: Map<string, SvgConfig> = new Map([
]);

window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.GREEN);
  const {vine} = start(
      'thoth',
      [],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement,
  );
});
