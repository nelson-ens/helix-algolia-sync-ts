import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import fetchHelixResourceMetadata from './services/helix';
import { addOrUpdateRecord, buildRecord, deleteRecord } from './services/algolia';
import { FetchHlxResMdParam, FetchHlxResMdResponse } from './types';
import { RESOURCE_PUBLISHED_EVENT_TYPE, RESOURCE_UNPUBLISHED_EVENT_TYPE } from './utils/constants';

/**
 *
 */
const getEnvs = () => {
  const appId = getInput('algolia-application-id');
  const apiKey = getInput('algolia-api-key');
  const indexName = getInput('algolia-index-name') || 'asdf';
  const branchName = context.ref.replace('refs/heads/', '');
  console.log('Logging getEnvs:', { appId, apiKey, indexName, branchName });
  return { appId, apiKey, indexName, branchName };
};

/**
 * run - main entry point
 */
const run = async () => {
  console.log('Logging github event context: ', JSON.stringify(context));
  const { appId, apiKey, indexName, branchName } = getEnvs();

  /**
   * @type {{org: string, path: string, site: string, status: number}}
   */
  const clientPayload = context.payload.client_payload;
  console.log('Logging clientPayload: ', clientPayload);
  if (!clientPayload) {
    throw new Error('No client payload found.');
  }

  const eventType = context.payload.action;
  console.log('Logging eventType: ', eventType);

  switch (eventType) {
    case RESOURCE_PUBLISHED_EVENT_TYPE:
      const fetchHlxResMdResponse: FetchHlxResMdResponse = await fetchHelixResourceMetadata(<FetchHlxResMdParam>{
        owner: clientPayload.org,
        repo: clientPayload.site,
        branch: branchName,
        path: clientPayload.path,
      });
      console.log('Logging fetchHlxResMdResponse: ', JSON.stringify(fetchHlxResMdResponse));
      const record = buildRecord(fetchHlxResMdResponse);
      await addOrUpdateRecord({ apiKey, appId, indexName, resourcePath: clientPayload.path, record });
      break;
    case RESOURCE_UNPUBLISHED_EVENT_TYPE:
      await deleteRecord({ apiKey, appId, indexName, resourcePath: clientPayload.path });
      break;
    default:
      console.warn(`Do nothing, eventType='${eventType}' is not supported`);
      break;
  }
};

/**
 * entry point
 */
run().catch((error) => {
  setFailed(`Action failed with error: ${(error as Error)?.message ?? 'Unknown error'}`);
});
