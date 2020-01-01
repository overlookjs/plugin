/* --------------------
 * @overlook/router module
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

// Make ROUTER_VERSION symbol
const {ROUTER_VERSION} = makeSymbols(pkgName, ['ROUTER_VERSION']);

/**
 * Router class
 * TODO Document different arguments signatures
 *
 * @param {string} [name] - Extension name
 * @param {string} [version] - Extension version
 * @param {function} [extend] - Extend function
 * @param {Object} [props] - Properties object or extension name as string
 * @param {string} [props.name] - Extension name
 * @param {string} [props.version] - Extension version
 * @param {function} [props.extend] - Extend function
 * @param {Object} [props.dependencies] - Dependencies object
 * @param {Array} [props.symbols] - Array of symbol names
 */
class Router {
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

		// Create Symbols and add to extension
		if (symbolNames) {
			const symbols = makeSymbols(name, symbolNames);
			Object.assign(this, symbols);
		}
	}
}

Router.ROUTER_VERSION = ROUTER_VERSION;
Router[ROUTER_VERSION] = pkgVersion;
Router.prototype[ROUTER_VERSION] = pkgVersion;

module.exports = Router;
