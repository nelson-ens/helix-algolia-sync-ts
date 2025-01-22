import { algoliasearch } from 'algoliasearch';
import { faker } from '@faker-js/faker';
import md5 from '../utils/stringUtils';
import { AlgoliaRecord, FetchHlxResMdResponse } from '../types';

export const transformToAlgRecord = (fetchHlxResMdResponse: FetchHlxResMdResponse): AlgoliaRecord => {
  console.log(`Logging transformToAlgRecord...`, fetchHlxResMdResponse?.results[0]?.record ?? {});
  // uses faker to populate records for development purpose
  const slug = faker.lorem.slug();
  const newResourcePath = `/blogs/${slug}.md`;
  const record = {
    webPath: `/blogs/${slug}`,
    resourcePath: `${newResourcePath}`,
    name: `${faker.food.dish()}`,
    lastModified: faker.date.anytime().getTime(),
    title: `${faker.food.dish()}`,
    image: `${faker.image.url()}`,
    description: `${faker.food.description()}`,
    category: `${faker.food.ethnicCategory()}`,
    author: `${faker.book.author()}`,
    date: faker.date.anytime().getTime(),
  } as AlgoliaRecord;
  console.log('Logging transformToAlgRecord: ', record);
  return record;
};

/**
 *
 * @param appId
 * @param apiKey
 * @param indexName
 * @param resourcePath
 */
export const addOrUpdateRecord = async ({
  appId,
  apiKey,
  indexName,
  resourcePath,
  record,
}: {
  appId: string;
  apiKey: string;
  indexName: string;
  resourcePath: string;
  record: AlgoliaRecord;
}) => {
  console.log('Logging addOrUpdateRecord: ', resourcePath);
  const client = algoliasearch(appId, apiKey);
  const response = await client.addOrUpdateObject({
    indexName,
    objectID: md5(resourcePath),
    body: record,
  });

  console.log(`Logging addOrUpdateRecord response: `, response);
};

/**
 *
 * @param appId
 * @param apiKey
 * @param indexName
 * @param resourcePath
 */
export const deleteRecord = async ({
  appId,
  apiKey,
  indexName,
  resourcePath,
}: {
  appId: string;
  apiKey: string;
  indexName: string;
  resourcePath: string;
}) => {
  console.log('Logging deleteRecord: ', resourcePath);
  const client = algoliasearch(appId, apiKey);
  await client.deleteObject({
    indexName,
    objectID: md5(resourcePath),
  });
};
