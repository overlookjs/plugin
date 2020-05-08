/* --------------------
 * @overlook/plugin module
 * Tests
 * Test function to ensure all exports present
 * ------------------*/

/* eslint-disable jest/no-export */

'use strict';

// Exports

module.exports = function itExports(Route) {
	it.each([
		'PLUGIN_VERSION'
	])('%s', (key) => {
		expect(typeof Route[key]).toBe('symbol');
	});
};
