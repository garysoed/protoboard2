import ActionTarget from './action-target';
import BaseElement from '../util/base-element';
import Component from './a-component';


@Component({
  dependencies: [ActionTarget],
  tag: 'pb-token',
  templateUrl: 'src/component/token.html',
})
class Token extends BaseElement { }

export default Token;
