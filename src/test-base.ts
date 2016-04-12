import TestAsync from '../node_modules/gs-tools/src/testing/test-async';
import TestDispose from '../node_modules/gs-tools/src/testing/test-dispose';
import TestEvent from '../node_modules/gs-tools/src/testing/test-event';
import TestSetup from '../node_modules/gs-tools/src/testing/test-setup';


const TEST_SETUP = new TestSetup([
  TestAsync,
  TestDispose,
  TestEvent,
]);

let initialized = false;

window['xtag'] = {};

export default {
  setup(): void {
    if (!initialized) {
      TEST_SETUP.setup();
      initialized = true;
    }
  },
};
