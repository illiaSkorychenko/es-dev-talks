import { Clients } from './Clients';

export interface Example {
  run: (clients: Clients) => Promise<void>;
}
