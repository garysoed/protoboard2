// import {registerSvg, start, UrlThemeLoader} from 'mask';
// import {ON_LOG_$, WebConsoleDestination} from 'santa';

// import protoboardSvg from './asset/icon.svg';
// import {$locationService} from './core/location-service';
// import {Root} from './root';


// const iconConfigs: Map<string, string> = new Map([
//   ['protoboard', protoboardSvg],
// ]);

// const webConsoleDestination = new WebConsoleDestination({installTrigger: true});
// ON_LOG_$.subscribe(log => {
//   webConsoleDestination.log(log);
// });

// window.addEventListener('load', () => {
//   const {vine} = start(
//       'protoboard',
//       [Root],
//       document,
//       new UrlThemeLoader('theme.css'),
//   );

//   for (const [key, content] of iconConfigs) {
//     registerSvg(vine, key, {type: 'embed', content});
//   }

//   $locationService.get(vine).run().subscribe();
// });

