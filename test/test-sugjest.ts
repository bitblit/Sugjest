import { Sugjest } from '../src/sugjest';

describe('#sugjest', function () {
  const [schDescribe, schIt] = Sugjest.create({
    namespace: 'neon',
    enabledTags: ['ffmpeg'],
  });

  it('should fail if passed a bad namespace', async () => {
    try {
      new Sugjest('this should fail');
      throw new Error('Did not throw expected error!');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('should provide a tuple of describe and it', () => {
    expect(schDescribe).toBeDefined();
    expect(schIt).toBeDefined();
  });

  describe('should skip tests based on configuration', () => {
    let foo = 'bar';
    schIt('should skip this test', () => {
      foo = 'baz';
    });
    expect(foo).toBe('bar');
  });
});
