import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import fetchHelixResourceMetadata from './utils/edsUtils';
import { addOrUpdateRecord, deleteRecord } from './utils/algUtils';

const run = async () => {
  console.log('Logging github event context: ', JSON.stringify(context));

  const apiKey = getInput('algolia-api-key');
  const appId = getInput('algolia-application-id');
  const indexName = getInput('algolia-index-name') || 'asdf';
  console.log('Logging apiKey: ', apiKey);
  console.log('Logging appId: ', appId);
  console.log('Logging indexName: ', indexName);

  const branchName = context.ref.replace('refs/heads/', '');
  console.log('Logging branchName: ', branchName);

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
  const helixResourceMetadata = await fetchHelixResourceMetadata({
    owner: clientPayload.org,
    repo: clientPayload.site,
    branch: branchName,
    path: clientPayload.path,
  });
  console.log('Logging helixResourceMetadata: ', JSON.stringify(helixResourceMetadata));

  if (eventType === 'resource-published') {
    await addOrUpdateRecord({ apiKey, appId, indexName, resourcePath: clientPayload.path });
  } else if (eventType === 'resource-unpublished') {
    await deleteRecord({ apiKey, appId, indexName, resourcePath: clientPayload.path });
  } else {
    console.warn('eventType not supported');
  }
};

run().catch((error) => {
  setFailed(`Action failed with error: ${(error as Error)?.message ?? 'Unknown error'}`);
});
