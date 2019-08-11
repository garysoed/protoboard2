import { assert, match, setup, should, test } from '@gs-testing';

import { TriggerParser } from './trigger-parser';
import { TriggerKey, TriggerType } from './trigger-spec';

test('@protoboard2/core/trigger-parser', () => {
  let parser: TriggerParser;

  setup(() => {
    parser = new TriggerParser();
  });

  test('convertBackward', () => {
    should(`convert 'click' correctly`, () => {
      assert(parser.convertBackward('click')).to.equal(match.anyObjectThat().haveProperties({
        success: true,
        result: match.anyObjectThat().haveProperties({
          type: TriggerType.CLICK,
        }),
      }));
    });

    should(`convert keys correctly`, () => {
      assert(parser.convertBackward('t')).to.equal(match.anyObjectThat().haveProperties({
        success: true,
        result: match.anyObjectThat().haveProperties({
          key: TriggerKey.T,
          type: TriggerType.KEY,
        }),
      }));
    });

    should(`fail if the string is invalid`, () => {
      assert(parser.convertBackward('invalid')).to.equal(match.anyObjectThat().haveProperties({
        success: false,
      }));
    });
  });

  test('convertForward', () => {
    should(`convert CLICK correctly`, () => {
      assert(parser.convertForward({type: TriggerType.CLICK}))
          .to.equal(match.anyObjectThat().haveProperties({
            success: true,
            result: 'click',
          }));
    });

    should(`convert KEY correctly`, () => {
      assert(parser.convertForward({key: TriggerKey.T, type: TriggerType.KEY}))
          .to.equal(match.anyObjectThat().haveProperties({
            success: true,
            result: 't',
          }));
        });
  });
});
