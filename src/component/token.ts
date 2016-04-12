import BaseComponent from './base-component';
import Component from './a-component';


@Component({
  tag: 'pb-token',
  templateUrl: 'src/component/token.html',
})
class Token extends BaseComponent { }

export default Token;
