/* --------------------
 * @overlook/plugin module
 * Tests
 * ------------------*/

'use strict';

// Modules
const store = require('@overlook/symbol-store'),
	extendMethod = require('class-extension').extend,
	Plugin = require('@overlook/plugin');

// Tests

// Init
const spy = jest.fn;

// Clear store before each test
beforeEach(() => {
	for (const key in store) {
		delete store[key];
	}

	expect(store).toContainAllKeys([]); // eslint-disable-line jest/no-standalone-expect
});

// Init mock Route class
let Route;
beforeEach(() => {
	Route = class {};
	Route.extend = extendMethod;
});

describe('extending Route with plugin', () => {
	let plugin, extend, ret;
	beforeEach(() => {
		extend = spy((R) => {
			ret = class extends R {};
			return ret;
		});

		plugin = new Plugin(extend);
	});

	it('calls extend function with Route class and plugin', () => {
		expect(extend).not.toHaveBeenCalled();
		Route.extend(plugin);
		expect(extend).toHaveBeenCalledTimes(1);
		expect(extend).toHaveBeenCalledWith(Route, plugin);
	});

	it('returns return value of extend function', () => {
		const SubRoute = Route.extend(plugin);
		expect(SubRoute).toBe(ret);
	});
});
