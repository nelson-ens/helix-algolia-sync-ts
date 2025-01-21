import { md5 } from './stringUtils';

describe('stringUtils functions', () => {
  beforeEach(() => {});

  afterEach(() => {});

  // Assert if setTimeout was called properly
  it('generates md5 hash accordingly', async () => {
    expect(md5('asdf')).toBe('912ec803b2ce49e4a541068d495ab570');
  });
});
