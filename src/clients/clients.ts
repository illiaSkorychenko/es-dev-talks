import { Client } from '@elastic/elasticsearch';
import { Clients } from '../types/Clients';
import { Pinecone } from '@pinecone-database/pinecone';
import { Ollama } from 'ollama';

export function getClients(): Clients {
  const esClient = new Client({
    node: `http://${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`,
  });

  const pcClient = new Pinecone({
    apiKey: process.env.PINECONE_KEY as string,
  });

  const ollamaClient = new Ollama();

  return {
    esClient,
    pcClient,
    ollamaClient
  };
}
