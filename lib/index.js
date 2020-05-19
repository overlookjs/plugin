/* --------------------
 * @overlook/plugin module
 * Entry point
 * ------------------*/

'use strict';

// Modules
const assert = require('assert'),
	{Extension, getOptionsFromArgs} = require('class-extension'),
	makeSymbols = require('@overlook/util-make-symbols'),
	{isArray} = require('is-it-type');

// Imports
const {name: pkgName, version: pkgVersion} = require('../package.json');

// Exports

// Make PLUGIN_VERSION symbol
const {PLUGIN_VERSION, IS_PLUGIN} = makeSymbols(pkgName, ['PLUGIN_VERSION', 'IS_PLUGIN']);

/**
 * Plugin class.
 * Receives `name`, `version`, `extend`, `extends`, `dependencies` and `symbols` properties.
 * Only `extend` is mandatory.
 * `version` is mandatory if `name` is provided.
 *
 * All props can be provided in a single props object.
 * Optionally, some properties can be provided as individual arguments:
 *   - `name` as 1st argument (string)
 *   - `version` as 2nd argument (string) (after `name`)
 *   - `extend` (function) as any argument
 *   - `extends` (array) as any argument
 *
 * Properties can also be provided as a series of props objects.
 * The last instance of a property takes precedence.
 * e.g. `({name: 'foo'}, {name: 'bar'})` -> `name` is 'bar'
 * Explicit arguments (e.g. `name` provided directly as arg) take precedence over properties,
 * regardless of order.
 * e.g. `('foo', {name: 'bar'})` -> `name` is 'foo'
 * e.g. `(() => {}, {extend() {}})` -> `extend` is first function
 *
 * Examples of acceptable arguments:
 *   - extend
 *   - extends, extend
 *   - name, version, extend
 *   - name, version, extends, extend
 *   - name, version, {extend}, {symbols}
 *   - {name, version, extend, extends, symbols}
 *   - {name, version}, {symbols}, extend
 *
 * @param {string} [name] - Plugin name
 * @param {string} [version] - Plugin version
 * @param {function} [extend] - Extend function
 * @param {Array<Plugin>} [extends] - Dependent plugins
 * @param {Object} [props] - Properties object
 * @param {string} [props.name] - Plugin name
 * @param {string} [props.version] - Plugin version
 * @param {function} [props.extend] - Extend function
 * @param {Array<Plugin>} [props.extends] - Dependent plugins
 * @param {Object} [props.dependencies] - Dependencies object
 * @param {Array} [props.symbols] - Array of symbol names
 */
class Plugin {
	constructor(...args) {
		// Combine args into options object
		const options = getOptionsFromArgs(args);

		// Validate extends array
		const _extends = options.extends;
		if (_extends) {
			assert(isArray(_extends), `extends option must be an array - received ${_extends}`);
			for (const plugin of _extends) {
				assert(isPlugin(plugin), `extends array must contain only plugins - received ${plugin}`);
			}
		}

		// Pass options to Extension constructor
		const extension = new Extension(options);
		Object.assign(this, extension);

		// Create Symbols and add to plugin
		const symbolNames = options.symbols;
		if (symbolNames) {
			const symbols = makeSymbols(options.name, symbolNames);
			Object.assign(this, symbols);
		}
	}
}

function isPlugin(p) {
	return !!p && !!p[IS_PLUGIN];
}

Plugin.isPlugin = isPlugin;
Plugin.PLUGIN_VERSION = PLUGIN_VERSION;
Plugin[PLUGIN_VERSION] = pkgVersion;
Plugin.prototype[PLUGIN_VERSION] = pkgVersion;
Plugin.prototype[IS_PLUGIN] = true;

module.exports = Plugin;
