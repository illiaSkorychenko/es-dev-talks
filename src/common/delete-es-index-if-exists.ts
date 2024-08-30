import { Client } from '@elastic/elasticsearch';

export async function deleteEsIndexIfExists(esClient: Client, index: string) {
  const indexExists = await esClient.indices.exists({
    index,
  });

  if (indexExists) {
    await esClient.indices.delete({
      index,
    });
  }
}
