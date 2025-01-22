import { faker } from '@faker-js/faker';
import { ADMIN_HLX_PAGE_INDEX_URL_PREFIX } from '../utils/constants';
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
  if (!response.ok)
    throw new Error(`Failed to fetch Helix resource metadata: ${response.status} ${response.statusText}`);

  const result = await response.json();
  console.log(`Logging fetchHelixResourceMetadata result: `, result);

  return transformToAlgRecord(result);
};

export default fetchHelixResourceMetadata;
