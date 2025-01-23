import { searchClient } from '@algolia/client-search';
import { addOrUpdateRecords, deleteRecords } from './algolia';

// Mock getInput and setFailed functions
jest.mock('@algolia/client-search', () => {
  const mockClient = { addOrUpdateObject: jest.fn(), deleteObject: jest.fn() };
  return { searchClient: jest.fn(() => mockClient) };
});

// jest.mock('@algolia/client-search');

describe('algolia service', () => {
  beforeEach(() => {
    // Clear all mock function calls and reset mock implementation
    jest.clearAllMocks();
  });

  afterEach(() => {});

  // Assert if setTimeout was called properly
  it('tests addOrUpdateRecords to ensure addOrUpdateObject was triggered 2 times', async () => {
    const client = searchClient('a', 'b');
    const x = await addOrUpdateRecords({
      appId: 'appId',
      apiKey: 'apiKey',
      indexName: 'indexName',
      records: [{ resourcePath: '/x/y1.md' }, { resourcePath: '/x/y2.md' }],
    });
    expect(client.addOrUpdateObject).toBeCalledTimes(2);
  });

  // Assert if setTimeout was called properly
  it('tests deleteRecords to ensure deleteObject was triggered 2 times', async () => {
    const client = searchClient('a', 'b');
    const x = await deleteRecords({
      appId: 'appId',
      apiKey: 'apiKey',
      indexName: 'indexName',
      paths: ['/x/y1.md', '/x/y2.md'],
    });
    expect(client.deleteObject).toBeCalledTimes(2);
  });
});
