import { addProcessor } from '@evershop/evershop/lib/util/registry.js';

export default async function panelThemeBootstrap(app) {
  // Theme config defaults
  addProcessor(
    'configurationSchema',
    (schema) => {
      schema.properties.system.properties.theme = { type: 'string' };
      return schema;
    },
    1
  );
}
