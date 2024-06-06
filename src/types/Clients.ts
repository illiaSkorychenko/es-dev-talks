import { Client } from '@elastic/elasticsearch';
import { Pinecone } from '@pinecone-database/pinecone';
import { Ollama } from 'ollama';

export interface Clients {
  esClient: Client;
  pcClient: Pinecone;
  ollamaClient: Ollama;
}
