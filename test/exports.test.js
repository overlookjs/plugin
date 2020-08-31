/* --------------------
 * @overlook/plugin module
 * Tests
 * CJS export
 * ------------------*/

'use strict';

// Modules
const Plugin = require('@overlook/plugin');

// Imports
const itExports = require('./exports.js');

// Tests

describe('CJS export', () => {
	it('is a class', () => {
		expect(Plugin).toBeFunction();
	});

	describe('has properties', () => {
		itExports(Plugin);
	});
});
