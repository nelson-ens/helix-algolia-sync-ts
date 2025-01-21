import {getInput, setFailed} from '@actions/core';
import {context} from '@actions/github';
import {faker} from '@faker-js/faker';
import {algoliasearch} from 'algoliasearch';
import fetchHelixResourceMetadata from './utils/edsUtils';
import md5 from './utils/stringUtils';

const run = async () => {
  console.log('Logging github event context: ', JSON.stringify(context));

  const apiKey = getInput('algolia-api-key');
  const appId = getInput('algolia-application-id');
  const indexName = getInput('algolia-index-name') || 'asdf';
  console.log('Logging apiKey: ', apiKey);
  console.log('Logging appId: ', appId);
  console.log('Logging indexName: ', indexName);

  const client = algoliasearch(appId, apiKey);

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
  try {
    const helixResourceMetadata = await fetchHelixResourceMetadata(
      clientPayload.org,
      clientPayload.site,
      branchName,
      clientPayload.path,
    );

    console.log(
      'Logging helixResourceMetadata: ',
      JSON.stringify(helixResourceMetadata),
    );

    const slug = faker.lorem.slug();
    const resourcePath = `/blogs/${slug}.md`;

    const record = {
      webPath: `/blogs/${slug}`,
      resourcePath: `${resourcePath}`,
      name: `${faker.food.dish()}`,
      lastModified: `${faker.date.anytime().getTime()}`,
      title: `${faker.food.dish()}`,
      image: `${faker.image.url()}`,
      description: `${faker.food.description()}`,
      category: `${faker.food.ethnicCategory()}`,
      author: `${faker.book.author()}`,
      date: `${faker.date.anytime().getTime()}`,
    };
    console.log('Logging record: ', record);

    const algAddOrUpdateObjResponse = await client.addOrUpdateObject({
      indexName,
      objectID: md5(resourcePath),
      body: record,
    });
  } catch (error) {
    setFailed((error as Error)?.message ?? 'Unknown error');
  }
};

run().catch(error => {
  console.error(
    `Action failed with error: ${(error as Error)?.message ?? 'Unknown error'}`,
  );
});
