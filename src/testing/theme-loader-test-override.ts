import {$themeLoader, UrlThemeLoader} from 'mask';
import {BehaviorSubject} from 'rxjs';


export const THEME_LOADER_TEST_OVERRIDE = {
  override: $themeLoader,
  withValue: new BehaviorSubject(new UrlThemeLoader('base/test.css')),
};