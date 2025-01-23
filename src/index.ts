import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { fetchHelixResourceMetadata } from './services/helix';
import { addOrUpdateRecords, deleteRecords } from './services/algolia';
import { AppCfg, ClientPayload, EventType, FetchHlxResMdParam } from './types';

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
  console.log('Logging index::getAppCfg...');
  const appId = getInput('algolia-application-id');
  const apiKey = getInput('algolia-api-key');
  const idxName = getInput('algolia-index-name') || 'asdf'; // TODO: remove 'asdf' default
  const branchName = context.ref.replace('refs/heads/', '');
  console.log('index::getAppCfg: ', { appId, apiKey, idxName, branchName });
  return <AppCfg>{ appId, apiKey, indexName: idxName, branchName };
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
  console.log('Logging index::processPublishEvent...');
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
  await addOrUpdateRecords({ apiKey, appId, indexName, records });
};

/**
 *
 * @param apiKey
 * @param appId
 * @param indexName
 * @param paths
 */
export const processUnpublishEvent = async ({ apiKey, appId, indexName, paths }: ProcessUnpublishEventParams) => {
  console.log('Logging index::processUnpublishEvent...');
  await deleteRecords({ apiKey, appId, indexName, paths });
};

/**
 *
 */
export const getClientPayload = () => {
  /**
   * @type {{org: string, path: string, site: string, status: number}}
   */
  const clientPayload: ClientPayload = context.payload.client_payload;
  console.log('Logging index::getClientPayload...', clientPayload);
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
  console.log('Logging index::validEventType...', eventType);

  if (Object.values(EventType).includes(eventType as EventType)) {
    return true;
  }

  return false;
};

/**
 *
 */
export const getEventType = () => {
  const eventType = context.payload.action;
  console.log('Logging index::getEventType...', eventType);
  if (!validEventType(eventType)) {
    throw new Error(`Unsupported eventType=${eventType}`);
  }
  return eventType as EventType;
};

/**
 *
 * @param clientPayload
 */
export const getPathsFromClientPayload = (clientPayload: ClientPayload) => {
  console.log('Logging index::extractPathsFromPayload...', clientPayload);
  if (clientPayload) {
    if (clientPayload.paths && clientPayload.paths.length > 0) {
      return clientPayload.paths;
    }
    if (clientPayload.path && clientPayload.path.length > 0) {
      return [clientPayload.path];
    }
  }
  return [];
};

/**
 * main runner
 */
export const run = async () => {
  console.log('Logging index::runner... ', JSON.stringify(context));
  const { appId, apiKey, indexName, branchName } = getAppCfg();

  // process payload
  const eventType = getEventType();
  const clientPayload = getClientPayload();
  const paths = getPathsFromClientPayload(clientPayload);

  if (paths && paths.length > 0) {
    // process event
    switch (eventType) {
      case EventType.RESOURCE_PUBLISHED:
      case EventType.RESOURCES_PUBLISHED:
        await processPublishEvent({ clientPayload, branchName, apiKey, appId, indexName, paths });
        break;
      case EventType.RESOURCE_UNPUBLISHED:
      case EventType.RESOURCES_UNPUBLISHED:
        await processUnpublishEvent({ apiKey, appId, indexName, paths });
        break;
      default:
        break;
    }
  } else {
    // else nothing to process, exist gracefully.
    console.log('No paths to process, runner completed');
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
