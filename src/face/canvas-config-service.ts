import {source} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {Subject, Observable} from 'rxjs';
import {scan, shareReplay} from 'rxjs/operators';

import {CanvasConfig, LineConfig} from './canvas-config';

export const $canvasConfigService = source('canvasConfigService', () => new CanvasConfigService());

export class CanvasConfigService {
  private readonly onLineConfigs$ = new Subject<[string, LineConfig]>();
  readonly lineConfig$ = this.createLineConfig();

  addConfig(configKey: string, config: CanvasConfig): void {
    this.onLineConfigs$.next([configKey, config]);
  }

  @cache()
  private createLineConfig(): Observable<ReadonlyMap<string, LineConfig>> {
    return this.onLineConfigs$.pipe(
        scan((acc, entry) => new Map([...acc, entry]), new Map<string, LineConfig>()),
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }
}
