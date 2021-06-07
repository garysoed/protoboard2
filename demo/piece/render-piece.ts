import {$asArray, $map, $pipe, $zip, countableIterable} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {renderCustomElement} from 'persona';
import {of} from 'rxjs';

import {RenderObjectFn} from '../../src/objects/render-object-spec';
import {IsRotatable} from '../../src/payload/is-rotatable';
import {$d1} from '../../src/piece/d1';
import {$d2} from '../../src/piece/d2';
import {$d6} from '../../src/piece/d6';
import {$renderedFace, FaceType} from '../core/rendered-face';


export function renderPiece(
    faceTypes: readonly FaceType[],
    objectId: StateId<IsRotatable>,
): RenderObjectFn {
  return () => {
    const faces = $pipe(
        faceTypes,
        $zip(countableIterable()),
        $map(([faceType, index]) => renderCustomElement({
          spec: $renderedFace,
          id: {id: objectId.id, face: index},
          attrs: new Map([['slot', `face-${index}`]]),
          inputs: {
            faceType,
          },
        })),
        $asArray(),
    );

    return of(renderCustomElement({
      spec: getSpec(faces.length),
      inputs: {objectId},
      id: objectId.id,
      children: faces,
    }));
  };
}

function getSpec(faceCount: number): typeof $d1|typeof $d2|typeof $d6 {
  switch (faceCount) {
    case 1:
      return $d1;
    case 2:
      return $d2;
    case 6:
      return $d6;
    default:
      throw new Error(`Unhandled number of faces: ${faceCount}`);
  }
}