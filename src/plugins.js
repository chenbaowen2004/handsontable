/**
 * Utility to register plugins and common namespace for keeping reference to all plugins classes.
 */
import Hooks from './pluginHooks';
import { objectEach } from './helpers/object';
import { toUpperCaseFirst } from './helpers/string';

const registeredPlugins = new WeakMap();

/**
 * Registers plugin under given name.
 *
 * @param {string} pluginName The plugin name.
 * @param {Function} PluginClass The plugin class.
 */
function registerPlugin(pluginName, PluginClass) {
  const correctedPluginName = toUpperCaseFirst(pluginName);

  Hooks.getSingleton().add('construct', function() {
    if (!registeredPlugins.has(this)) {
      registeredPlugins.set(this, {});
    }

    const holder = registeredPlugins.get(this);

    if (!holder[correctedPluginName]) {
      holder[correctedPluginName] = new PluginClass(this);
    }
  });
  Hooks.getSingleton().add('afterDestroy', function() {
    if (registeredPlugins.has(this)) {
      const pluginsHolder = registeredPlugins.get(this);

      objectEach(pluginsHolder, plugin => plugin.destroy());
      registeredPlugins.delete(this);
    }
  });
}

/**
 * @param {Core} instance The Handsontable instance.
 * @param {string} pluginName The plugin name.
 * @returns {Function} PluginClass Returns plugin instance if exists or `undefined` if not exists.
 */
function getPlugin(instance, pluginName) {
  if (typeof pluginName !== 'string') {
    throw Error('Only strings can be passed as "plugin" parameter');
  }
  const _pluginName = toUpperCaseFirst(pluginName);

  if (!registeredPlugins.has(instance) || !registeredPlugins.get(instance)[_pluginName]) {
    return void 0;
  }

  return registeredPlugins.get(instance)[_pluginName];
}

/**
 * Get all registred plugins names for concrete Handsontable instance.
 *
 * @param {Core} hotInstance The Handsontable instance.
 * @returns {Array}
 */
function getRegistredPluginNames(hotInstance) {
  return registeredPlugins.has(hotInstance) ? Object.keys(registeredPlugins.get(hotInstance)) : [];
}

/**
 * Get plugin name.
 *
 * @param {Core} hotInstance The Handsontable instance.
 * @param {BasePlugin} plugin The plugin instance.
 * @returns {string|null}
 */
function getPluginName(hotInstance, plugin) {
  let pluginName = null;

  if (registeredPlugins.has(hotInstance)) {
    objectEach(registeredPlugins.get(hotInstance), (pluginInstance, name) => {
      if (pluginInstance === plugin) {
        pluginName = name;
      }
    });
  }

  return pluginName;
}

export { registerPlugin, getPlugin, getRegistredPluginNames, getPluginName };
