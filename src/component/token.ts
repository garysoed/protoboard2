import ActionTarget from './action-target';
import {BaseElement} from '../../node_modules/gs-tools/src/webc/base-element';
import {Element} from '../util/a-element';


@Element({
  dependencies: [ActionTarget],
  tag: 'pb-token',
  templateUrl: 'src/component/token.html',
})
class Token extends BaseElement { }

export default Token;
