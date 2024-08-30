import { randomUUID } from 'node:crypto';
import { deleteEsIndexIfExists } from '../common/delete-es-index-if-exists';
import { Clients } from '../types/Clients';
import { setTimeout } from 'node:timers/promises';

const INDEX_NAME = 'simple';

interface Doc {
  name: string;
  age: number;
}

export async function run(clients: Clients) {
  await deleteEsIndexIfExists(clients.esClient, INDEX_NAME);

  await clients.esClient.create<Doc>({
    id: randomUUID(),
    index: INDEX_NAME,
    document: {
      age: 22,
      name: 'John',
    },
  });

  await clients.esClient.create<Doc>({
    id: randomUUID(),
    index: INDEX_NAME,
    document: {
      age: 40,
      name: 'Bob',
    },
  });

  await setTimeout(2000);

  const res1 = await clients.esClient.search<Doc>({
    index: INDEX_NAME,
    query: {
      match: {
        name: 'John',
      },
    },
  });

  console.log('\nBy name', JSON.stringify(res1, null, 2));

  const res2 = await clients.esClient.search<Doc>({
    index: INDEX_NAME,
    query: {
      query_string: {
        fields: ['name'],
        query: 'J*',
      },
    },
  });

  console.log('\nBy name latter', JSON.stringify(res2, null, 2));

  const res3 = await clients.esClient.search<Doc>({
    profile: true,
    index: INDEX_NAME,
    query: {
      range: {
        age: {
          gte: 25,
        },
      },
    },
  });

  // const res3 = await clients.esClient.search<Doc>({
  //   index: INDEX_NAME,
  //   query: {
  //     query_string: {
  //       query: 'age:[40 TO *]',
  //     },
  //   },
  // });

  console.log('\nBy age', JSON.stringify(res3, null, 2));
}
