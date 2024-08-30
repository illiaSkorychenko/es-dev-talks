import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { Clients } from '../types/Clients';
import { randomUUID } from 'node:crypto';
import { deleteEsIndexIfExists } from '../common/delete-es-index-if-exists';

const INDEX_NAME = 'embeddings';

export async function run(clients: Clients) {
  await create(clients);
  await search(clients);
}

async function create(clients: Clients) {
  await deleteEsIndexIfExists(clients.esClient, INDEX_NAME)
  await clients.esClient.indices.create({
  index: INDEX_NAME,
    mappings: {
      properties: {
        text: {
          type: 'keyword',
        },
        vector: {
          type: 'dense_vector',
          similarity: 'cosine',
          // similarity: 'l2_norm',
          dims: 1024,
        },
      },
    },
  });

  const inputs = ['dog', 'car', 'human'];
  for (let input of inputs) {
    const resp = await clients.ollamaClient.embeddings({
      model: 'mxbai-embed-large',
      prompt: input,
    });

    await clients.esClient.create({
      id: randomUUID(),
      index: INDEX_NAME,
      document: {
        text: input,
        vector: resp.embedding,
      },
    });
  }
}

async function search(clients: Clients) {
  const testData = [
    {
      expect: 'dog',
      value: 'pet',
    },
    {
      expect: 'car',
      value: 'truck',
    },
    {
      expect: 'human',
      value: 'person',
    }
  ];

  let successCount = 0;

  for (const el of testData) {
    const resp = await clients.ollamaClient.embeddings({
      model: 'mxbai-embed-large',
      prompt: el.value,
    });

    const res = await clients.esClient.search({
      index: INDEX_NAME,
      knn: {
        field: 'vector',
        query_vector: resp.embedding,
        k: 10,
        num_candidates: 100,
      },
      _source: {
        excludes: ['vector'],
      },
    });

    const hint = res.hits.hits[0] as SearchHit<{ text: string }>;
    let message = `Expected ${el.expect} for ${el.value}, received ${hint._source?.text}`;

    if (el.expect === hint._source?.text) {
      ++successCount;
    } else {
      message = 'ERROR ' + message;

      console.log(JSON.stringify(res.hits, null, 2));
    }

    console.log(message);
  }

  console.log(`${successCount}/${testData.length}`);
}
