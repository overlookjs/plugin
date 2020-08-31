/* --------------------
 * @overlook/plugin module
 * Tests
 * ESM export
 * ------------------*/

// Modules
import Plugin, * as namedExports from '@overlook/plugin/es';

// Imports
import itExports from './exports.js';

// Tests

describe('ESM export', () => {
	it('default export is a class', () => {
		expect(Plugin).toBeFunction();
	});

	describe('default export has properties', () => {
		itExports(Plugin);
	});

	describe('named exports', () => {
		itExports(namedExports);
	});
});
