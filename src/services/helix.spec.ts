import { buildAlgoliaRecord, fetchHelixResourceMetadata } from './helix';
import { FetchHlxResMdResponse } from '../types';

const goodResponse = {
  webPath: '/blogs/blog1',
  resourcePath: '/blogs/blog1.md',
  results: [
    {
      name: 'default',
      record: {
        lastModified: 1737588336,
        title: 'blog1',
        image: '/default-meta-image.png?width=1200&format=pjpg&optimize=medium',
        description: '',
        category: '',
        author: '',
      },
    },
    {
      name: '#simple',
      record: {
        lastModified: 1737588336,
      },
    },
  ],
} as FetchHlxResMdResponse;

const badResponse = {
  webPath: '/blogs/blog123',
  resourcePath: '/blogs/blog123.md',
  results: [
    {
      name: 'default',
      message: 'requested path returned a 301 or 404',
    },
    {
      name: '#simple',
      message: 'requested path returned a 301 or 404',
    },
  ],
} as FetchHlxResMdResponse;

let mockedResponseStatus: boolean = true;
let mockResponse = goodResponse;
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: mockedResponseStatus,
    status: 'status',
    statusText: 'statusText',
    json: () => Promise.resolve(mockResponse),
  })
) as jest.Mock;

describe('helix service', () => {
  beforeEach(() => {
    // Clear all mock function calls and reset mock implementation
    jest.clearAllMocks();
  });

  afterEach(() => {});

  // Assert if setTimeout was called properly
  it('tests addOrUpdateRecord', async () => {
    const record = buildAlgoliaRecord(mockResponse);
    expect(record.webPath).toBe('/blogs/blog1');
    expect(record.resourcePath).toBe('/blogs/blog1.md');
  });

  it('should return an algolia record', async () => {
    const x = await fetchHelixResourceMetadata({ owner: 'owner', repo: 'repo', branch: 'branch', path: 'path' });
    expect(x.webPath).toEqual('/blogs/blog1');
    expect(x.resourcePath).toEqual('/blogs/blog1.md');
  });

  it('should return an undefiend record when helix resource not found', async () => {
    mockResponse = badResponse;
    const x = await fetchHelixResourceMetadata({ owner: 'owner', repo: 'repo', branch: 'branch', path: 'path' });
    expect(x).toBeUndefined();
  });

  it('should throw an error when response.ok is false', async () => {
    mockedResponseStatus = false;

    await expect(async () => {
      await fetchHelixResourceMetadata({ owner: 'owner', repo: 'repo', branch: 'branch', path: 'path' });
    }).rejects.toThrowError();
  });

  it('tests addOrUpdateRecord to return {} object', async () => {
    const mockInput = { ...mockResponse } as FetchHlxResMdResponse;

    delete mockInput.results[0].record;
    expect(buildAlgoliaRecord(mockInput)).toEqual(undefined);

    mockInput.results = [];
    expect(buildAlgoliaRecord(mockInput)).toEqual(undefined);
    delete mockInput.results;
    expect(buildAlgoliaRecord(mockInput)).toEqual(undefined);

    expect(buildAlgoliaRecord({})).toEqual(undefined);
    expect(buildAlgoliaRecord(undefined)).toEqual(undefined);
    expect(buildAlgoliaRecord(null)).toEqual(undefined);
  });
});
