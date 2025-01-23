import { searchClient } from '@algolia/client-search';
import md5 from '../utils/stringUtils';
import { AlgoliaRecord } from '../types';

interface DeleteRecordParams {
  appId: string;
  apiKey: string;
  indexName: string;
  paths: string[];
}

interface AddOrUpdateRecordParams {
  appId: string;
  apiKey: string;
  indexName: string;
  records: AlgoliaRecord[];
}

/**
 *
 * @param appId
 * @param apiKey
 * @param indexName
 * @param resourcePath
 */
export const addOrUpdateRecord = async ({ appId, apiKey, indexName, records }: AddOrUpdateRecordParams) => {
  console.log('Logging algolia::addOrUpdateRecord... ', records);
  const client = searchClient(appId, apiKey);
  const response = await Promise.all(
    records.map((r) =>
      client.addOrUpdateObject({
        indexName,
        objectID: md5(r.resourcePath),
        body: r,
      })
    )
  );

  console.log(`algolia::addOrUpdateRecord response: `, response);
};

/**
 *
 * @param appId
 * @param apiKey
 * @param indexName
 * @param resourcePath
 */
export const deleteRecord = async ({ appId, apiKey, indexName, paths }: DeleteRecordParams) => {
  console.log('Logging algolia::deleteRecord... ', paths);
  const client = searchClient(appId, apiKey);

  const response = await Promise.all(
    paths.map((path) =>
      client.deleteObject({
        indexName,
        objectID: md5(path),
      })
    )
  );

  console.log(`algolia::deleteRecord response: `, response);
};
