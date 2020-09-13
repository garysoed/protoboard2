// import { cache } from 'gs-tools/export/data';
// import { instanceofType } from 'gs-types';
// import { _p } from 'mask';
// import { element, host, multi, PersonaContext, renderCustomElement } from 'persona';
// import { Observable, of as observableOf } from 'rxjs';
// import { switchMap } from 'rxjs/operators';

// import { IsContainer } from '../action/payload/is-container';
// import { PickAction } from '../action/pick-action';
// import { $baseComponent, BaseComponent } from '../core/base-component';
// import { TriggerSpec } from '../core/trigger-spec';
// import { registerObjectCreateSpec } from '../objects/object-service';
// import { renderContents } from '../render/render-contents';

// import template from './supply.html';

// // TODO: Should only be for demo.
// /**
//  * Type of the supply region.
//  *
//  * @thModule region
//  */


// /**
//  * The supply object API.
//  *
//  * @thModule region
//  */
// export const $supply = {
//   tag: 'pb-supply',
//   api: {
//     ...$baseComponent.api,
//   },
// };


// export const $ = {
//   host: host($supply.api),
//   root: element('root', instanceofType(HTMLDivElement), {
//     content: multi('#content'),
//   }),
// };

// /**
//  * Payload of the supply region.
//  *
//  * @thModule region
//  */
// export type SupplyPayload = IsContainer;


// /**
//  * Represents a region containing the supply.
//  *
//  * @thModule region
//  */
// @_p.customElement({
//   ...$supply,
//   template,
//   configure: vine => {
//   },
// })
// export class Supply extends BaseComponent<SupplyPayload> {
//   constructor(context: PersonaContext) {
//     super(
//         new Map([
//           [TriggerSpec.CLICK, context => new PickAction(context, {location: 0})],
//         ]),
//         context,
//         $.host,
//     );

//     this.render($.root._.content, this.contents$);
//   }

//   @cache()
//   private get contents$(): Observable<readonly Node[]> {
//     return this.objectSpec$.pipe(
//       switchMap(state => {
//         if (!state) {
//           return observableOf([]);
//         }

//         return renderContents(state, this.context);
//       }),
//     );
//   }
// }
