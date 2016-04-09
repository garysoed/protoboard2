import { bootstrap } from '../node_modules/angular2/platform/browser';
import Jsons from '../node_modules/gs-tools/src/jsons';
import RootComponent from './root';

Jsons.setValue(window, 'pb.run', () => {
  bootstrap(RootComponent);
});
