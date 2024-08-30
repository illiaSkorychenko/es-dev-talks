import { config } from 'dotenv';
import { Example } from './types/Example';
import * as fs from 'node:fs';
import { getClients } from './clients/clients';
import path from 'path';

function validateInput(input: string[]): boolean {
  if (!input.length) {
    return false;
  }

  const examplesFileNames = fs.readdirSync(path.resolve(__dirname, 'examples'));
  const isFileExists = examplesFileNames.find((fileName) => {
    const nameWithoutExtension = fileName.split('.')[0];

    return nameWithoutExtension == input[0];
  });

  if (!isFileExists) {
    return false;
  }

  return true;
}

async function runExample(exampleNumber: string) {
  const example: Example = require(`./examples/${exampleNumber}`);
  const clients = getClients();

  await example.run(clients);
}

async function main() {
  const consoleInput = process.argv.slice(2);
  const isConsoleArgsValid = validateInput(consoleInput);

  if (!isConsoleArgsValid) {
    console.log('\x1b[31mUnexpected example name\x1b[0m');
    process.exit(1);
  }

  config();

  const [exampleName] = consoleInput;
  await runExample(exampleName);
}
main();
