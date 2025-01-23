import { getInput } from '@actions/core';
import { context } from '@actions/github';
import {
  getAppCfg,
  getClientPayload,
  getEventType,
  getPathsFromClientPayload,
  processPublishEvent,
  processUnpublishEvent,
  validEventType,
} from './index';
import { ClientPayload } from './types';
import { fetchHelixResourceMetadata } from './services/helix';
import { addOrUpdateRecord, deleteRecord } from './services/algolia';

jest.mock('./services/algolia', () => ({
  addOrUpdateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}));

jest.mock('./services/helix', () => ({
  fetchHelixResourceMetadata: jest.fn(),
}));

// Mock getInput and setFailed functions
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
}));

// Mock context and getOctokit functions
jest.mock('@actions/github', () => ({
  context: {
    payload: {
      action: 'resource-published',
      client_payload: {
        org: 'nelson-ens',
        path: '/index.md',
        site: 'aem-eds-boilerplate',
        status: 200,
      },
    },
    repo: {
      owner: 'owner',
      repo: 'repo',
    },
    ref: 'refs/heads/main',
  },
  getOctokit: jest.fn(),
}));

describe('main index', () => {
  beforeEach(() => {
    // Clear all mock function calls and reset mock implementation
    jest.clearAllMocks();
  });

  afterEach(() => {});

  it('should return clientPayload', async () => {
    // Mock the return values for getInput
    expect(getClientPayload()).toEqual({
      org: 'nelson-ens',
      path: '/index.md',
      site: 'aem-eds-boilerplate',
      status: 200,
    });
  });

  it('should return appCfg as expected', async () => {
    // Mock the return values for getInput
    (getInput as jest.Mock).mockReturnValueOnce('algolia-application-id');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-api-key');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-index-name');
    context.payload.client_payload = undefined;

    expect(getAppCfg()).toEqual({
      appId: 'algolia-application-id',
      apiKey: 'algolia-api-key',
      indexName: 'algolia-index-name',
      branchName: 'main',
    });
  });

  it('should throw an error in checkClientPayload', async () => {
    // Mock the return values for getInput
    (getInput as jest.Mock).mockReturnValueOnce('algolia-application-id');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-api-key');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-index-name');
    context.payload.client_payload = undefined;

    expect(getClientPayload).toThrowError('No client payload found.');
  });

  it('should return an array of paths', async () => {
    const clientPayloadMock = {
      org: 'nelson-ens',
      site: 'aem-eds-boilerplate',
      status: 200,
    };

    expect(getPathsFromClientPayload({ ...clientPayloadMock, path: '/index.md' } as ClientPayload)).toEqual([
      '/index.md',
    ]);

    expect(
      getPathsFromClientPayload({
        ...clientPayloadMock,
        paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
      } as ClientPayload)
    ).toEqual(['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md']);
  });

  it('should throw an error in extractPathsFromPayload', async () => {
    const clientPayloadMock = {
      org: 'nelson-ens',
      site: 'aem-eds-boilerplate',
      status: 200,
    };

    expect(() => {
      getPathsFromClientPayload(clientPayloadMock);
    }).toThrowError('Unable to proceed due to invalid or missing paths in ClientPayload');

    expect(() => {
      getPathsFromClientPayload({
        ...clientPayloadMock,
        path: '',
      } as ClientPayload);
    }).toThrowError('Unable to proceed due to invalid or missing paths in ClientPayload');
  });

  it('should return truthy if eventType is valid', async () => {
    // Mock the return values for getInput
    context.payload.client_payload = undefined;

    expect(validEventType('resource-published')).toBeTruthy();
    expect(validEventType('resources-published')).toBeTruthy();
    expect(validEventType('resource-unpublished')).toBeTruthy();
    expect(validEventType('resources-unpublished')).toBeTruthy();
  });

  it('should return falsy if eventType is valid', async () => {
    // Mock the return values for getInput
    context.payload.client_payload = undefined;

    expect(validEventType('RESOURCE-PUBLISHED')).toBeFalsy();
    expect(validEventType('resource-publishedd')).toBeFalsy();
    expect(validEventType('RESOURCE-UNPUBLISHED')).toBeFalsy();
    expect(validEventType('resource-unpublishedd')).toBeFalsy();
    expect(validEventType('')).toBeFalsy();
    expect(validEventType(null)).toBeFalsy();
    expect(validEventType(undefined)).toBeFalsy();
  });

  it('should return eventType', async () => {
    expect(getEventType()).toBe('resource-published');
  });

  it('should throw an error in extractEventType', async () => {
    context.payload.action = 'blah';
    expect(getEventType).toThrowError('Unsupported eventType=blah');
  });

  it('should test processPublishEvent successfully', async () => {
    const x = await processPublishEvent({
      clientPayload: {},
      branchName: 'bn',
      apiKey: 'ak',
      appId: 'ai',
      indexName: 'in',
      paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
    });
    expect(fetchHelixResourceMetadata).toBeCalledTimes(3);
    expect(addOrUpdateRecord).toBeCalledTimes(1);
  });

  it('should test processUnpublishEvent successfully', async () => {
    const x = await processUnpublishEvent({
      apiKey: 'ak',
      appId: 'ai',
      indexName: 'in',
      paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
    });
    expect(deleteRecord).toBeCalledTimes(1);
  });
});
