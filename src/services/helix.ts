import { faker } from '@faker-js/faker';
import { ADMIN_HLX_PAGE_INDEX_URL_PREFIX } from '../utils/constants';
import { AlgoliaRecord, FetchHlxResMdResponse } from '../types';

export const buildAlgoliaRecord = (hlxResource: FetchHlxResMdResponse): AlgoliaRecord => {
  console.log(`Logging buildAlgoliaRecord...`, hlxResource);

  if (hlxResource && hlxResource.results && hlxResource.results[0] && hlxResource.results[0].record) {
    // TODO:  replace faker with real data once schema is ready
    return {
      webPath: hlxResource.webPath,
      resourcePath: hlxResource.resourcePath,
      name: `${faker.food.dish()}`,
      lastModified: faker.date.anytime().getTime(),
      title: `${faker.food.dish()}`,
      image: `${faker.image.url()}`,
      description: `${faker.food.description()}`,
      category: `${faker.food.ethnicCategory()}`,
      author: `${faker.book.author()}`,
      date: faker.date.anytime().getTime(),
    } as AlgoliaRecord;
  }

  return undefined;
};

/**
 *
 * @param owner
 * @param repo
 * @param branch
 * @param path
 */
const fetchHelixResourceMetadata = async ({
  owner,
  repo,
  branch,
  path,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}) => {
  const modPath = path.replace(/^\/*/, '');
  const url = new URL(`${ADMIN_HLX_PAGE_INDEX_URL_PREFIX}/${owner}/${repo}/${branch}/${modPath}`);
  console.log(`Logging fetchHelixResourceMetadata: `, { url, modPath });

  const response = await fetch(url);
  console.log(`Fetch response: `, JSON.stringify(response));

  if (!response.ok)
    throw new Error(`Failed to fetch Helix resource metadata: ${response.status} ${response.statusText}`);

  const jsonRsp = await response.json();
  console.log(`Logging fetchHelixResourceMetadata result: `, JSON.stringify(jsonRsp));

  // page does not exist
  if (JSON.stringify(jsonRsp).includes('requested path returned a 301 or 404')) {
    return undefined;
  }
  // transform to AlgRecord
  return buildAlgoliaRecord(jsonRsp);
};

export default fetchHelixResourceMetadata;
