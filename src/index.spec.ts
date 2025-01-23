import { getInput } from '@actions/core';
import { context } from '@actions/github';
import { ClientPayload } from './types';
import { fetchHelixResourceMetadata } from './services/helix';
import { addOrUpdateRecords, deleteRecords } from './services/algolia';

import * as myModule from './index';

jest.mock('./services/algolia', () => ({
  addOrUpdateRecords: jest.fn(),
  deleteRecords: jest.fn(),
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
  const goodClientPayload = {
    org: 'nelson-ens',
    path: '/index.md',
    site: 'aem-eds-boilerplate',
    status: 200,
  };

  const emptyPathsClientPayload = {
    org: 'nelson-ens',
    site: 'aem-eds-boilerplate',
    status: 200,
  };

  beforeEach(() => {
    // Clear all mock function calls and reset mock implementation
    jest.clearAllMocks();
    context.payload.client_payload = goodClientPayload;
  });

  afterEach(() => {});

  it('should return clientPayload', async () => {
    // Mock the return values for getInput
    expect(myModule.getClientPayload()).toEqual({
      org: 'nelson-ens',
      path: '/index.md',
      site: 'aem-eds-boilerplate',
      status: 200,
    });
  });

  it('should run processPublishEvent', async () => {
    context.payload.action = 'resource-published';
    const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(async () => {});
    const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(async () => {});

    const x = await myModule.run();
    expect(processPublishEventSpy).toHaveBeenCalledTimes(1);
    expect(processUnpublishEventSpy).toHaveBeenCalledTimes(0);

    processPublishEventSpy.mockRestore();
    processUnpublishEventSpy.mockRestore();
  });

  it('should run processUnPublishEvent', async () => {
    context.payload.action = 'resource-unpublished';
    const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(async () => {});
    const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(async () => {});

    const x = await myModule.run();
    expect(processUnpublishEventSpy).toHaveBeenCalledTimes(1);
    expect(processPublishEventSpy).toHaveBeenCalledTimes(0);

    processUnpublishEventSpy.mockRestore();
    processPublishEventSpy.mockRestore();
  });

  it('should not run neither processPublishEvent nor processUnPublishEvent', async () => {
    context.payload.action = 'blah';
    const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(async () => {});
    const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(async () => {});

    await expect(async () => {
      await myModule.run();
    }).rejects.toThrowError();

    processUnpublishEventSpy.mockRestore();
    processPublishEventSpy.mockRestore();
    context.payload.action = 'resource-published';
  });

  it('should return appCfg as expected', async () => {
    // Mock the return values for getInput
    (getInput as jest.Mock).mockReturnValueOnce('algolia-application-id');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-api-key');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-index-name');

    expect(myModule.getAppCfg()).toEqual({
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

    expect(myModule.getClientPayload).toThrowError('No client payload found.');
  });

  it('should return an array of paths', async () => {
    const clientPayloadMock = {
      org: 'nelson-ens',
      site: 'aem-eds-boilerplate',
      status: 200,
    };

    expect(myModule.getPathsFromClientPayload({ ...clientPayloadMock, path: '/index.md' } as ClientPayload)).toEqual([
      '/index.md',
    ]);

    expect(
      myModule.getPathsFromClientPayload({
        ...clientPayloadMock,
        paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
      } as ClientPayload)
    ).toEqual(['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md']);
  });

  it('should throw an error in extractPathsFromPayload', async () => {
    expect(myModule.getPathsFromClientPayload(emptyPathsClientPayload)).toEqual([]);
    expect(
      myModule.getPathsFromClientPayload({
        ...emptyPathsClientPayload,
        path: '',
      } as ClientPayload)
    ).toEqual([]);
    expect(
      myModule.getPathsFromClientPayload({
        ...emptyPathsClientPayload,
        paths: [],
      } as ClientPayload)
    ).toEqual([]);
    expect(
      myModule.getPathsFromClientPayload({
        ...emptyPathsClientPayload,
        paths: undefined,
      } as ClientPayload)
    ).toEqual([]);
  });

  it('should return truthy if eventType is valid', async () => {
    // Mock the return values for getInput
    expect(myModule.validEventType('resource-published')).toBeTruthy();
    expect(myModule.validEventType('resources-published')).toBeTruthy();
    expect(myModule.validEventType('resource-unpublished')).toBeTruthy();
    expect(myModule.validEventType('resources-unpublished')).toBeTruthy();
  });

  it('should return falsy if eventType is valid', async () => {
    expect(myModule.validEventType('RESOURCE-PUBLISHED')).toBeFalsy();
    expect(myModule.validEventType('resource-publishedd')).toBeFalsy();
    expect(myModule.validEventType('RESOURCE-UNPUBLISHED')).toBeFalsy();
    expect(myModule.validEventType('resource-unpublishedd')).toBeFalsy();
    expect(myModule.validEventType('')).toBeFalsy();
    expect(myModule.validEventType(null)).toBeFalsy();
    expect(myModule.validEventType(undefined)).toBeFalsy();
  });

  it('should return eventType', async () => {
    context.payload.action = 'resource-published';
    expect(myModule.getEventType()).toBe('resource-published');
  });

  it('should throw an error in extractEventType', async () => {
    context.payload.action = 'blah';
    expect(myModule.getEventType).toThrowError('Unsupported eventType=blah');
  });

  it('should test processPublishEvent successfully', async () => {
    context.payload.action = 'resource-published';
    const x = await myModule.processPublishEvent({
      clientPayload: {},
      branchName: 'bn',
      apiKey: 'ak',
      appId: 'ai',
      indexName: 'in',
      paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
    });
    expect(fetchHelixResourceMetadata).toBeCalledTimes(3);
    expect(addOrUpdateRecords).toBeCalledTimes(1);
  });

  it('should test processUnpublishEvent successfully', async () => {
    context.payload.action = 'resource-unpublished';
    const x = await myModule.processUnpublishEvent({
      apiKey: 'ak',
      appId: 'ai',
      indexName: 'in',
      paths: ['/blogs/blog1.md', '/blogs/blog2.md', '/blogs/blog3.md'],
    });
    expect(deleteRecords).toBeCalledTimes(1);
  });

  it('should not run neither processPublishEvent nor processUnPublishEvent', async () => {
    context.payload.action = 'resource-published';
    context.payload.client_payload = emptyPathsClientPayload;

    const processPublishEventSpy = jest.spyOn(myModule, 'processPublishEvent').mockImplementation(async () => {});
    const processUnpublishEventSpy = jest.spyOn(myModule, 'processUnpublishEvent').mockImplementation(async () => {});

    await myModule.run();
    expect(processPublishEventSpy).toHaveBeenCalledTimes(0);
    expect(processUnpublishEventSpy).toHaveBeenCalledTimes(0);

    processUnpublishEventSpy.mockRestore();
    processPublishEventSpy.mockRestore();
  });
});
