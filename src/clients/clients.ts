import { Client } from '@elastic/elasticsearch';
import { Clients } from '../types/Clients';
import { Ollama } from 'ollama';

export function getClients(): Clients {
  const esClient = new Client({
    node: `http://${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`,
  });

  const ollamaClient = new Ollama();

  return {
    esClient,
    ollamaClient
  };
}
