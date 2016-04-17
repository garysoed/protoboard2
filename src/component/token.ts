import ActionTarget from './action-target';
import BaseComponent from './base-component';
import Component from './a-component';


@Component({
  dependencies: [ActionTarget],
  tag: 'pb-token',
  templateUrl: 'src/component/token.html',
})
class Token extends BaseComponent { }

export default Token;
