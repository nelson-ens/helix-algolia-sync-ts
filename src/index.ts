import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { fetchHelixResourceMetadata } from './services/helix';
import { addOrUpdateRecord, deleteRecord } from './services/algolia';
import { AppCfg, ClientPayload, FetchHlxResMdParam } from './types';
import {
  RESOURCE_PUBLISHED_EVENT_TYPE,
  RESOURCE_UNPUBLISHED_EVENT_TYPE,
  RESOURCES_PUBLISHED_EVENT_TYPE,
  RESOURCES_UNPUBLISHED_EVENT_TYPE,
} from './utils/constants';

interface ProcessPublishEventParams {
  clientPayload: ClientPayload;
  branchName: string;
  apiKey: string;
  appId: string;
  indexName: string;
  paths: string[];
}

interface ProcessUnpublishEventParams {
  apiKey: string;
  appId: string;
  indexName: string;
  paths: string[];
}

/**
 *
 */
export const getAppCfg = () => {
  console.log('Logging getAppCfg...');
  const appId = getInput('algolia-application-id');
  const apiKey = getInput('algolia-api-key');
  const indexName = getInput('algolia-index-name') || 'asdf'; // TODO: remove 'asdf' default
  const branchName = context.ref.replace('refs/heads/', '');
  console.log('Logging getAppCfg:', { appId, apiKey, indexName, branchName });
  return <AppCfg>{ appId, apiKey, indexName, branchName };
};

/**
 *
 * @param clientPayload
 * @param branchName
 * @param apiKey
 * @param appId
 * @param indexName
 * @param paths
 */
export const processPublishEvent = async ({
  clientPayload,
  branchName,
  apiKey,
  appId,
  indexName,
  paths,
}: ProcessPublishEventParams) => {
  console.log('Logging processPublishEvent...');
  const promises = [];
  for (let i = 0; i < paths.length; i += 1) {
    const path = paths[i];
    promises.push(
      fetchHelixResourceMetadata(<FetchHlxResMdParam>{
        owner: clientPayload.org,
        repo: clientPayload.site,
        branch: branchName,
        path,
      })
    );
  }
  let records = await Promise.all(promises);
  records = records.filter((element) => element !== undefined);
  await addOrUpdateRecord({ apiKey, appId, indexName, records });
};

/**
 *
 * @param apiKey
 * @param appId
 * @param indexName
 * @param paths
 */
export const processUnpublishEvent = async ({ apiKey, appId, indexName, paths }: ProcessUnpublishEventParams) => {
  console.log('Logging processUnpublishEvent...');
  await deleteRecord({ apiKey, appId, indexName, paths });
};

/**
 *
 */
export const getClientPayload = () => {
  /**
   * @type {{org: string, path: string, site: string, status: number}}
   */
  const clientPayload: ClientPayload = context.payload.client_payload;
  console.log('Logging getClientPayload: ', clientPayload);
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
  if (
    eventType === RESOURCE_PUBLISHED_EVENT_TYPE ||
    eventType === RESOURCES_PUBLISHED_EVENT_TYPE ||
    eventType === RESOURCE_UNPUBLISHED_EVENT_TYPE ||
    eventType === RESOURCES_UNPUBLISHED_EVENT_TYPE
  ) {
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

export const getPathsFromClientPayload = (clientPayload: ClientPayload) => {
  console.log('Logging extractPathsFromPayload...');
  if (clientPayload) {
    if (clientPayload.paths && clientPayload.paths.length > 0) {
      return clientPayload.paths;
    }
    if (clientPayload.path && clientPayload.path.length > 0) {
      return [clientPayload.path];
    }
  }
  throw new Error(`Unable to proceed due to invalid or missing paths in ClientPayload`);
};

/**
 * run - main entry point
 */
export const run = async () => {
  console.log('Logging runner: ', JSON.stringify(context));
  const { appId, apiKey, indexName, branchName } = getAppCfg();

  // process payload
  const eventType = getEventType();
  const clientPayload = getClientPayload();
  const paths = getPathsFromClientPayload(clientPayload);

  // process event
  switch (eventType) {
    case RESOURCE_PUBLISHED_EVENT_TYPE:
    case RESOURCES_PUBLISHED_EVENT_TYPE:
      await processPublishEvent({ clientPayload, branchName, apiKey, appId, indexName, paths });
      break;
    case RESOURCE_UNPUBLISHED_EVENT_TYPE:
    case RESOURCES_UNPUBLISHED_EVENT_TYPE:
      await processUnpublishEvent({ apiKey, appId, indexName, paths });
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
