import { randomUUID } from 'node:crypto';
import { deleteEsIndexIfExists } from '../common/delete-es-index-if-exists';
import { Clients } from '../types/Clients';
import { setTimeout } from 'node:timers/promises';

const INDEX_NAME = 'agg';

interface Doc {
  type: 'a' | 'b' | 'c';
  createdAt: Date;
}

export async function run(clients: Clients) {
  await deleteEsIndexIfExists(clients.esClient, INDEX_NAME);

  await clients.esClient.indices.create({
    index: INDEX_NAME,
    mappings: {
      properties: {
        type: {
          type: 'keyword',
        },
        createdAt: {
          type: 'date',
        },
      },
    },
  });

  await clients.esClient.create<Doc>({
    id: randomUUID(),
    index: INDEX_NAME,
    document: {
      type: 'a',
      createdAt: new Date('2024-08-29T12:39:54.699Z'),
    },
  });

  await clients.esClient.create<Doc>({
    id: randomUUID(),
    index: INDEX_NAME,
    document: {
      type: 'a',
      createdAt: new Date('2024-09-29T12:39:54.699Z'),
    },
  });

  await clients.esClient.create<Doc>({
    id: randomUUID(),
    index: INDEX_NAME,
    document: {
      type: 'b',
      createdAt: new Date('2024-08-29T12:39:54.699Z'),
    },
  });

  await clients.esClient.create<Doc>({
    id: randomUUID(),
    index: INDEX_NAME,
    document: {
      type: 'c',
      createdAt: new Date('2024-07-29T12:39:54.699Z'),
    },
  });

  await setTimeout(2000);

  const res = await clients.esClient.search<Doc>({
    index: INDEX_NAME,
    aggs: {
      BY_TYPE: {
        terms: {
          field: 'type',
        },
      },
      BY_TYPE_DOC_COUNT: {
        max_bucket: {
          buckets_path: 'BY_TYPE>_count',
        },
      },
      BY_DATE: {
        date_histogram: {
          field: 'createdAt',
          calendar_interval: 'month',
        },
        aggs: {
          BY_TYPE: {
            terms: {
              field: 'type',
            },
          },
        },
      },
    },
  });

  console.log('\n', JSON.stringify(res, null, 2));
}
