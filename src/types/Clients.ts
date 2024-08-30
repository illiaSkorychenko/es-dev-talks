import { Client } from '@elastic/elasticsearch';
import { Ollama } from 'ollama';

export interface Clients {
  esClient: Client;
  ollamaClient: Ollama;
}
