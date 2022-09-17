import {Vine} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {ParseType, RenderSpec, renderString} from 'persona';
import {firstValueFrom, of} from 'rxjs';


import {exportFace} from './export-face';
import goldens from './goldens/goldens.json';

test('@protoboard2/src/export/export-face', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/export/goldens', goldens));
    const vine = new Vine({appName: 'test'});
    return {vine};
  });

  should('emit the correct dataUri', async () => {
    const faceSpec: RenderSpec = renderString({
      raw: of(`
        <svg viewBox="0 0 20 30" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="5" height="5" fill="steelblue"></rect>
          <foreignObject x="0" y="10" width="5" height="5">
            <div xmlns="http://www.w3.org/1999/xhtml">
              <style>.text { font-family: Helvetica; font-size: 5px; }</style>
              <div class="text">Test</div>
            </div>
          </foreignObject>
        </svg>
        `),
      spec: {},
      parseType: ParseType.HTML,
    });
    const dataUri$ = of(faceSpec).pipe(
        exportFace({width: 400, height: 600}, {vine: _.vine, document}),
    );

    assert(await firstValueFrom(dataUri$)).to.matchSnapshot('export-face.txt');
  });
});