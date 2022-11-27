import {assertByType} from 'gs-tools/export/rxjs';
import {instanceofType} from 'gs-types';
import {RenderSpec} from 'persona';
import {render, RenderContext} from 'persona/export/internal';
import {from, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';


interface Dimension {
  readonly height: number;
  readonly width: number;
}

export function exportFace(dimension: Dimension, context: RenderContext): OperatorFunction<RenderSpec, string> {
  const canvas = document.createElement('canvas');
  canvas.width = dimension.width;
  canvas.height = dimension.height;

  const context2d = canvas.getContext('2d');
  if (!context2d) {
    throw new Error('2d context could not be created');
  }

  return pipe(
      switchMap(renderSpec => render(renderSpec, context)),
      assertByType(instanceofType(SVGElement)),
      switchMap(svg => {
        const svgData = `data:image/svg+xml;base64,${btoa(svg.outerHTML)}`;
        const image = new Image(dimension.width, dimension.height);
        image.src = svgData;

        return from(image.decode()).pipe(map(() => image));
      }),
      map(image => {
        context2d.drawImage(image, 0, 0);
        return canvas.toDataURL('image/png');
      }),
  );
}