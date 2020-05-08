/* --------------------
 * @overlook/plugin module
 * ESM entry point
 * Re-export CJS with named exports
 * ------------------*/

// Exports

import Plugin from '../lib/index.js';

export default Plugin;
export const {
	// Static methods
	isPlugin,

	// Symbols
	PLUGIN_VERSION
} = Plugin;
