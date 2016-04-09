import { Component } from '../node_modules/angular2/core';
import Test from './test';

@Component({
  selector: '[pb-root]',
  directives: [Test]
})
export default class Root {
  ngOnInit() {
    debugger;
  }
}
