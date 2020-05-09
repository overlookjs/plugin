/* --------------------
 * @overlook/plugin module
 * Tests
 * Test function to ensure all exports present
 * ------------------*/

/* eslint-disable jest/no-export */

'use strict';

// Exports

module.exports = function itExports(Plugin) {
	describe('methods', () => {
		it.each([
			'isPlugin'
		])('%s', (key) => {
			expect(Plugin[key]).toBeFunction();
		});
	});

	describe('symbols', () => {
		it.each([
			'PLUGIN_VERSION'
		])('%s', (key) => {
			expect(typeof Plugin[key]).toBe('symbol');
		});
	});
};
