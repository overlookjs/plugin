/* --------------------
 * @overlook/plugin module
 * Tests
 * ------------------*/

'use strict';

// Modules
const Plugin = require('@overlook/plugin'),
	{isPlugin} = Plugin;

// Tests

describe('isPlugin static method', () => {
	it('is a function', () => {
		expect(isPlugin).toBeFunction();
	});

	it('returns true for a Plugin', () => {
		const plugin = new Plugin(() => {});
		expect(isPlugin(plugin)).toBeTrue();
	});

	describe('returns false for', () => {
		it('plugin class', () => {
			expect(isPlugin(Plugin)).toBeFalse();
		});

		it('object', () => {
			expect(isPlugin({})).toBeFalse();
		});

		it('function', () => {
			expect(isPlugin(() => {})).toBeFalse();
		});

		it('null', () => {
			expect(isPlugin(null)).toBeFalse();
		});
	});
});
