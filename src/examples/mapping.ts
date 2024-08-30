import { randomUUID, randomBytes } from 'node:crypto';
import { deleteEsIndexIfExists } from '../common/delete-es-index-if-exists';
import { Clients } from '../types/Clients';
import { setTimeout } from 'node:timers/promises';

const KEYWORD_INDEX_NAME = 'keyword';
const TEXT_INDEX_NAME = 'text';

// "{{fieldName}}" {
//   "type": "text",
//   "fields": {
//     "keyword": {
//       "type": "keyword",
//       "ignore_above": 256
//     }
//   }
// }

interface KeywordDoc {
  k: string;
}

interface TextDoc {
  t: string;
}

function generateRandomString(len: number) {
  const bytes = randomBytes(Math.ceil(len / 2));
  const str = bytes.toString('hex');
  
  if (len % 2 !== 0) {
    return str.slice(0, len);
  }

  return str;
}

export async function run(clients: Clients) {
  await deleteEsIndexIfExists(clients.esClient, KEYWORD_INDEX_NAME);
  await deleteEsIndexIfExists(clients.esClient, TEXT_INDEX_NAME);
  await setTimeout(2000);

  await clients.esClient.indices.create({
    index: KEYWORD_INDEX_NAME,
    mappings: {
      properties: {
        k: {
          type: 'keyword',
        },
      },
    },
  });

  await clients.esClient.indices.create({
    index: TEXT_INDEX_NAME,
    mappings: {
      properties: {
        t: {
          type: 'text',
        },
      },
    },
  });

  
  // for (let i = 0; i < 100; i++) {
  //   const str = randomUUID();
  //   await clients.esClient.create<KeywordDoc>({
  //     id: randomUUID(),
  //     index: KEYWORD_INDEX_NAME,
  //     document: {
  //       k: str,
  //     },
  //   });
  //   await clients.esClient.create<TextDoc>({
  //     id: randomUUID(),
  //     index: TEXT_INDEX_NAME,
  //     document: {
  //       t: str,
  //     },
  //   });
  // }
  // return;

  const str = 'someData';

  await clients.esClient.create<KeywordDoc>({
    id: randomUUID(),
    index: KEYWORD_INDEX_NAME,
    document: {
      k: str,
    },
  });
  await clients.esClient.create<TextDoc>({
    id: randomUUID(),
    index: TEXT_INDEX_NAME,
    document: {
      t: str,
    },
  });
  await setTimeout(2000);

  const res1 = await clients.esClient.search<KeywordDoc>({
    index: KEYWORD_INDEX_NAME,
    query: {
      match: {
        k: str.toUpperCase(),
      },
    },
  });
  console.log('Keyword match', JSON.stringify(res1, null, 2));

  const res2 = await clients.esClient.search<TextDoc>({
    index: TEXT_INDEX_NAME,
    query: {
      match: {
        t: str.toUpperCase(),
      },
    },
  });
  console.log('Text match',JSON.stringify(res2, null, 2));

  const res3 = await clients.esClient.search<KeywordDoc>({
    index: KEYWORD_INDEX_NAME,
    query: {
      term: {
        k: str,
      },
    },
  });
  console.log('Keyword term',JSON.stringify(res3, null, 2));

  const res4 = await clients.esClient.search<TextDoc>({
    index: TEXT_INDEX_NAME,
    query: {
      term: {
        t: str,
      },
    },
  });
  console.log('Text term',JSON.stringify(res4, null, 2));
}
