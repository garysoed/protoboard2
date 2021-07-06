import {source} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {assertUnreachable} from 'gs-tools/export/typescript';
import {Observable, ReplaySubject} from 'rxjs';
import {scan, shareReplay, startWith} from 'rxjs/operators';

import {CanvasConfig, IconConfig, LineConfig} from './canvas-config';


export const $canvasConfigService = source(() => new CanvasConfigService());

export class CanvasConfigService {
  private readonly onIconConfigs$ = new ReplaySubject<[string, IconConfig]>();
  private readonly onLineConfigs$ = new ReplaySubject<[string, LineConfig]>();
  readonly iconConfig$ = this.createIconConfig();
  readonly lineConfig$ = this.createLineConfig();

  addConfig(configKey: string, config: CanvasConfig): void {
    switch (config.type) {
      case 'icon':
        this.onIconConfigs$.next([configKey, config]);
        break;
      case 'line':
        this.onLineConfigs$.next([configKey, config]);
        break;
      default:
        assertUnreachable(config);
    }
  }

  @cache()
  private createIconConfig(): Observable<ReadonlyMap<string, IconConfig>> {
    return this.onIconConfigs$.pipe(
        scan((acc, entry) => new Map([...acc, entry]), new Map<string, IconConfig>()),
        startWith(new Map()),
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }

  @cache()
  private createLineConfig(): Observable<ReadonlyMap<string, LineConfig>> {
    return this.onLineConfigs$.pipe(
        scan((acc, entry) => new Map([...acc, entry]), new Map<string, LineConfig>()),
        startWith(new Map()),
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }
}
