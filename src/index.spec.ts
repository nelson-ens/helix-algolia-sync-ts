import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { checkClientPayload, getEventType, run, validEventType } from './index';

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
    expect(checkClientPayload()).toEqual({
      org: 'nelson-ens',
      path: '/index.md',
      site: 'aem-eds-boilerplate',
      status: 200,
    });
  });

  it('should throw an error in checkClientPayload', async () => {
    // Mock the return values for getInput
    (getInput as jest.Mock).mockReturnValueOnce('algolia-application-id');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-api-key');
    (getInput as jest.Mock).mockReturnValueOnce('algolia-index-name');
    context.payload.client_payload = undefined;

    expect(checkClientPayload).toThrowError('No client payload found.');
  });

  it('should return truthy if eventType is valid', async () => {
    // Mock the return values for getInput
    context.payload.client_payload = undefined;

    expect(validEventType('resource-published')).toBeTruthy();
    expect(validEventType('resource-unpublished')).toBeTruthy();
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

  it('should throw an error in getEventType', async () => {
    context.payload.action = 'blah';
    expect(getEventType).toThrowError('Unsupported eventType=blah');
  });
});
