/* --------------------
 * @overlook/plugin module
 * Entry point
 * ------------------*/

'use strict';

// Modules
const {Extension} = require('class-extension'),
	makeSymbols = require('@overlook/util-make-symbols'),
	{isObject, isString} = require('is-it-type');

// Imports
const {name: pkgName, version: pkgVersion} = require('../package.json');

// Exports

// Make PLUGIN_VERSION symbol
const {PLUGIN_VERSION} = makeSymbols(pkgName, ['PLUGIN_VERSION']);

/**
 * Plugin class.
 * Receives `name`, `version`, `extend`, `dependencies` and `symbols` properties.
 * Only `extend` is mandatory.
 * `version` is mandatory if `name` is provided.
 *
 * All props can be provided in a single props object.
 * Optionally, some properties can be provided as individual arguments:
 *   - `name` as 1st argument (string)
 *   - `version` as 2nd argument (string) (after `name`)
 *   - `extend` as 1st argument, or after `name` + `version`
 *
 * Properties can also be provided as a series of props objects.
 * The first instance of a property takes precedence.
 * e.g. `({name: 'foo'}, {name: 'bar'})` -> name is 'foo'
 *
 * Examples of acceptable arguments:
 *   - extend
 *   - name, version, extend
 *   - name, version, {extend}, {symbols}
 *   - {name, version, extend, symbols}
 *   - {name, version}, {symbols}, extend
 *
 * @param {string} [name] - Plugin name
 * @param {string} [version] - Plugin version
 * @param {function} [extend] - Extend function
 * @param {Object} [props] - Properties object
 * @param {string} [props.name] - Plugin name
 * @param {string} [props.version] - Plugin version
 * @param {function} [props.extend] - Extend function
 * @param {Object} [props.dependencies] - Dependencies object
 * @param {Array} [props.symbols] - Array of symbol names
 */
class Plugin {
	constructor(...argsOrig) {
		// Merge object arguments + extract name and symbolNames
		const args = [];
		let props;
		for (const arg of argsOrig) {
			if (isObject(arg)) {
				if (!props) {
					props = {...arg};
				} else {
					// Earlier arguments take precedence
					for (const key in arg) {
						if (props[key] === undefined) props[key] = arg[key];
					}
				}
			} else {
				args.push(arg);
			}
		}

		let name = null;
		if (isString(args[0])) name = args[0];

		let symbolNames;
		if (props) {
			args.push(props);
			symbolNames = props.symbols;
			if (name == null) name = props.name;
		}

		// Pass arguments to Extension constructor
		const extension = new Extension(...args);
		Object.assign(this, extension);

		// Create Symbols and add to plugin
		if (symbolNames) {
			const symbols = makeSymbols(name, symbolNames);
			Object.assign(this, symbols);
		}
	}
}

Plugin.PLUGIN_VERSION = PLUGIN_VERSION;
Plugin[PLUGIN_VERSION] = pkgVersion;
Plugin.prototype[PLUGIN_VERSION] = pkgVersion;

module.exports = Plugin;
