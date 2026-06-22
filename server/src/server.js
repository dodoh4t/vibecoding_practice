require('dotenv').config();

const createApp = require('./app');
const { getConfig, assertRuntimeConfig } = require('./config');

const config = getConfig();
assertRuntimeConfig(config);

const app = createApp({ config });

app.listen(config.port, () => {
  console.log(`dodoTodoList API listening on port ${config.port}`);
});
