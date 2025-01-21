import { algoliasearch } from 'algoliasearch';
import md5 from './stringUtils';
import { faker } from '@faker-js/faker';
import { AlgRecord } from '../types/models';

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
}: {
  appId: string;
  apiKey: string;
  indexName: string;
  resourcePath: string;
}) => {
  console.log('Logging addOrUpdateRecord: ', resourcePath);
  const client = algoliasearch(appId, apiKey);
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
  } as AlgRecord;
  console.log('Logging record: ', record);

  await client.addOrUpdateObject({
    indexName,
    objectID: md5(resourcePath),
    body: record,
  });
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
