import { source, stream, Vine } from 'grapevine';
import { SimpleIdGenerator } from 'gs-tools/export/random';
import { map } from 'rxjs/operators';

import { $stateService } from '../../src/state/state-service';

const ID_GENERATOR = new SimpleIdGenerator();

export const $generateObjectId = stream(
    vine => $stateService.get(vine).pipe(
        map(service => {
          return () => {
            return ID_GENERATOR.generate(service.objectIds);
          };
        }),
    ),
    globalThis,
);
