import {assert, objectThat, should, test} from 'gs-testing';

import {DetailedTriggerSpec, triggerSpecParser, TriggerType} from './trigger-spec';


test('@protoboard2/core/trigger-spec', () => {
  test('BooleanFlagParser', () => {
    test('convertBackward', () => {
      should('convert true values correctly', () => {
        assert(triggerSpecParser().convertBackward('p:meta')).to.haveProperties({
          success: true,
          result: objectThat<DetailedTriggerSpec>().haveProperties({
            type: TriggerType.P,
            meta: true,
          }),
        });
      });

      should('convert false values correctly', () => {
        assert(triggerSpecParser().convertBackward('p:nometa')).to.haveProperties({
          success: true,
          result: objectThat<DetailedTriggerSpec>().haveProperties({
            type: TriggerType.P,
            meta: false,
          }),
        });
      });

      should('convert empty strings correctly', () => {
        assert(triggerSpecParser().convertBackward('p:||')).to.haveProperties({
          success: true,
          result: objectThat<DetailedTriggerSpec>().haveProperties({type: TriggerType.P}),
        });
      });

      should('fail if the string doesn\'t match', () => {
        assert(triggerSpecParser().convertBackward('p:blah')).to.haveProperties({
          success: true,
          result: objectThat<DetailedTriggerSpec>().haveProperties({type: TriggerType.P}),
        });
      });
    });

    test('convertForward', () => {
      should('convert undefined values correctly', () => {
        assert(triggerSpecParser().convertForward({type: TriggerType.P, alt: undefined})).to.haveProperties({
          success: true,
          result: 'p',
        });
      });

      should('convert true value correctly', () => {
        assert(triggerSpecParser().convertForward({type: TriggerType.P, alt: true})).to.haveProperties({
          success: true,
          result: 'p:alt',
        });
      });

      should('convert false value correctly', () => {
        assert(triggerSpecParser().convertForward({type: TriggerType.P, meta: false})).to.haveProperties({
          success: true,
          result: 'p:nometa',
        });
      });
    });
  });

  test('UnreservedTriggerSpecParser', () => {
    test('convertBackward', () => {
      should('convert trigger with options correctly', () => {
        assert(triggerSpecParser().convertBackward('p:meta|alt|noctrl')).to.haveProperties({
          success: true,
          result: objectThat<DetailedTriggerSpec>().haveProperties({
            type: TriggerType.P,
            alt: true,
            ctrl: false,
            meta: true,
          }),
        });
      });

      should('exclude invalid options', () => {
        assert(triggerSpecParser().convertBackward('p:meta|blah|noctrl')).to.haveProperties({
          success: true,
          result: objectThat<DetailedTriggerSpec>().haveProperties({
            type: TriggerType.P,
            ctrl: false,
            meta: true,
          }),
        });
      });

      should('convert triggers without any options', () => {
        assert(triggerSpecParser().convertBackward('p')).to.haveProperties({
          success: true,
          result: objectThat<DetailedTriggerSpec>().haveProperties({type: TriggerType.P}),
        });
      });

      should('fail if the type part is invalid', () => {
        assert(triggerSpecParser().convertBackward('\n')).to.haveProperties({
          success: false,
        });
      });
    });

    test('convertForward', () => {
      should('convert triggers with options correctly', () => {
        const trigger = {
          type: TriggerType.P,
          alt: true,
          ctrl: false,
          meta: true,
        } as const;
        assert(triggerSpecParser().convertForward(trigger)).to.haveProperties({
          success: true,
          result: 'p:alt|noctrl|meta',
        });
      });

      should('convert triggers without options correctly', () => {
        const trigger = {
          type: TriggerType.P,
        } as const;
        assert(triggerSpecParser().convertForward(trigger)).to.haveProperties({
          success: true,
          result: 'p',
        });
      });

      should('convert simple triggers correctly', () => {
        assert(triggerSpecParser().convertForward({type: TriggerType.P})).to.haveProperties({
          success: true,
          result: 'p',
        });
      });
    });
  });
});