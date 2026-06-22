const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const openApiPath = path.resolve(__dirname, '../../../api-spec.yaml');
const openApiYaml = fs.readFileSync(openApiPath, 'utf8');
const openApiDocument = YAML.parse(openApiYaml);

function docsRoutes() {
  return [
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      explorer: true,
      customSiteTitle: 'dodoTodoList API Docs',
      swaggerOptions: {
        url: '/api/openapi.yaml'
      }
    })
  ];
}

function openApiYamlHandler(_req, res) {
  res.type('text/yaml').send(openApiYaml);
}

module.exports = {
  docsRoutes,
  openApiYamlHandler
};
