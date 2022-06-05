import loadEnv from "./loadEnv";

import Client from "./structures/Client";

loadEnv();
const client: Client = new Client();

client.start();
