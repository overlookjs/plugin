/* --------------------
 * @overlook/plugin module
 * Tests
 * Test function to ensure all exports present
 * ------------------*/

/* eslint-disable jest/no-export */

'use strict';

// Exports

module.exports = function itExports(Route) {
	describe('methods', () => {
		it.each([
			'isPlugin'
		])('%s', (key) => {
			expect(Route[key]).toBeFunction();
		});
	});

	describe('symbols', () => {
		it.each([
			'PLUGIN_VERSION'
		])('%s', (key) => {
			expect(typeof Route[key]).toBe('symbol');
		});
	});
};
