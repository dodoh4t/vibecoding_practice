require('dotenv').config();

const createApp = require('../src/app');
const { getConfig, assertRuntimeConfig } = require('../src/config');

const config = getConfig();
assertRuntimeConfig(config);

module.exports = createApp({ config });
