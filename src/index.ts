import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import fetchHelixResourceMetadata from './services/helix';
import { addOrUpdateRecord, transformToAlgRecord, deleteRecord } from './services/algolia';
import { AppCfg, FetchHlxResMdParam, FetchHlxResMdResponse } from './types';
import { RESOURCE_PUBLISHED_EVENT_TYPE, RESOURCE_UNPUBLISHED_EVENT_TYPE } from './utils/constants';

/**
 *
 */
export const getAppCfg = () => {
  const appId = getInput('algolia-application-id');
  const apiKey = getInput('algolia-api-key');
  const indexName = getInput('algolia-index-name') || 'asdf';
  const branchName = context.ref.replace('refs/heads/', '');
  console.log('Logging getEnvs:', { appId, apiKey, indexName, branchName });
  return <AppCfg>{ appId, apiKey, indexName, branchName };
};

/**
 *
 * @param clientPayload
 * @param branchName
 * @param apiKey
 * @param appId
 * @param indexName
 */
export const processPublishEvent = async (
  clientPayload,
  branchName: string,
  apiKey: string,
  appId: string,
  indexName: string
) => {
  console.log('Logging processPublishEvent');
  const fetchHlxResMdResponse: FetchHlxResMdResponse = await fetchHelixResourceMetadata(<FetchHlxResMdParam>{
    owner: clientPayload.org,
    repo: clientPayload.site,
    branch: branchName,
    path: clientPayload.path,
  });

  const record = transformToAlgRecord(fetchHlxResMdResponse);
  await addOrUpdateRecord({ apiKey, appId, indexName, resourcePath: clientPayload.path, record });
};

/**
 *
 * @param apiKey
 * @param appId
 * @param indexName
 * @param clientPayload
 */
export const processUnpublishEvent = async (apiKey: string, appId: string, indexName: string, clientPayload) => {
  console.log('Logging processPublishEvent');
  await deleteRecord({ apiKey, appId, indexName, resourcePath: clientPayload.path });
};

/**
 *
 */
export const checkClientPayload = () => {
  /**
   * @type {{org: string, path: string, site: string, status: number}}
   */
  const clientPayload = context.payload.client_payload;
  console.log('Logging checkClientPayload: ', clientPayload);
  if (!clientPayload) {
    throw new Error('No client payload found.');
  }
  return clientPayload;
};

/**
 *
 * @param eventType
 */
export const validEventType = (eventType: string) => {
  if (eventType === RESOURCE_PUBLISHED_EVENT_TYPE || eventType === RESOURCE_UNPUBLISHED_EVENT_TYPE) {
    return true;
  }

  return false;
};

/**
 *
 */
export const getEventType = () => {
  const eventType = context.payload.action;
  console.log('Logging getEventType: ', eventType);
  if (!validEventType(eventType)) {
    throw new Error(`Unsupported eventType=${eventType}`);
  }
  return eventType;
};

/**
 * run - main entry point
 */
export const run = async () => {
  console.log('Logging run: ', JSON.stringify(context));
  const { appId, apiKey, indexName, branchName } = getAppCfg();
  const clientPayload = checkClientPayload();
  const eventType = getEventType();

  switch (eventType) {
    case RESOURCE_PUBLISHED_EVENT_TYPE:
      await processPublishEvent(clientPayload, branchName, apiKey, appId, indexName);
      break;
    case RESOURCE_UNPUBLISHED_EVENT_TYPE:
      await processUnpublishEvent(apiKey, appId, indexName, clientPayload);
      break;
    default:
      break;
  }
};

/**
 * entry point
 */
if (!process.env.JEST_WORKER_ID) {
  run().catch((error) => {
    setFailed(`Action failed with error: ${(error as Error)?.message ?? 'Unknown error'}`);
  });
}
