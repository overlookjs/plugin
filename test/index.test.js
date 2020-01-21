/* --------------------
 * @overlook/plugin module
 * Tests
 * ------------------*/

'use strict';

// Modules
const store = require('@overlook/symbol-store'),
	{isArray} = require('is-it-type'),
	flatMap = require('core-js-pure/features/array/flat-map'),
	Plugin = require('../index');

// Tests

// Clear store before each test
beforeEach(() => {
	for (const key in store) {
		delete store[key];
	}

	expect(store).toContainAllKeys([]); // eslint-disable-line jest/no-standalone-expect
});

it('exports a class', () => {
	expect(Plugin).toBeFunction();
});

it('creates a Plugin instance', () => {
	const plugin = new Plugin(() => {});
	expect(plugin).toBeInstanceOf(Plugin);
});

describe('records arguments', () => {
	const argsStrs = makeArgStrings(['name', 'version', 'extend']);

	// Sanity check - check tests are covering all possibilities
	it('tests cover all possibilities', () => {
		expect(argsStrs).toHaveLength(28);
	});

	for (const argsStr of argsStrs) {
		describe(argsStr, () => {
			let plugin, extend;
			beforeEach(() => {
				extend = () => {};
				const createArgs = makeCreateArgsFn(argsStr);
				const args = createArgs('foo', '1.0.0', extend);
				plugin = new Plugin(...args);
			});

			it('records name', () => {
				expect(plugin.name).toBe('foo');
			});

			it('records version', () => {
				expect(plugin.version).toBe('1.0.0');
			});

			it('records extend function', () => {
				expect(plugin.extend).toBe(extend);
			});
		});
	}
});

describe('creates symbols', () => {
	describe('with no name, when arguments', () => {
		const argsStrs = makeArgStrings(['symbols', 'extend']);

		// Sanity check - check tests are covering all possibilities
		it('tests cover all possibilities', () => {
			expect(argsStrs).toHaveLength(5);
		});

		for (const argsStr of argsStrs) {
			describe(argsStr, () => {
				let createArgs;
				beforeEach(() => {
					const createArgsFull = makeCreateArgsFn(argsStr);
					createArgs = symbols => createArgsFull(null, null, () => {}, symbols);
				});

				it('returns symbols', () => {
					const args = createArgs(['BAR', 'QUX']);
					const {BAR, QUX} = new Plugin(...args);
					expect(typeof BAR).toBe('symbol');
					expect(String(BAR)).toBe('Symbol(BAR)');
					expect(typeof QUX).toBe('symbol');
					expect(String(QUX)).toBe('Symbol(QUX)');
				});

				it('does not cache symbols', () => {
					const args1 = createArgs(['BAR']);
					const plugin1 = new Plugin(...args1);

					const args2 = createArgs(['BAR']);
					const plugin2 = new Plugin(...args2);

					expect(typeof plugin1.BAR).toBe('symbol');
					expect(typeof plugin2.BAR).toBe('symbol');
					expect(plugin1.BAR).not.toBe(plugin2.BAR);
				});
			});
		}
	});

	describe('with name, when arguments', () => {
		const argsStrs = makeArgStrings(['name', 'version', 'symbols', 'extend']);

		// Sanity check - check tests are covering all possibilities
		it('tests cover all possibilities', () => {
			expect(argsStrs).toHaveLength(145);
		});

		for (const argsStr of argsStrs) {
			describe(argsStr, () => {
				let createArgs;
				beforeEach(() => {
					const createArgsFull = makeCreateArgsFn(argsStr);
					createArgs = symbols => createArgsFull('foo', '1.0.0', () => {}, symbols);
				});

				it('returns symbols', () => {
					const args = createArgs(['BAR', 'QUX']);
					const {BAR, QUX} = new Plugin(...args);
					expect(typeof BAR).toBe('symbol');
					expect(String(BAR)).toBe('Symbol(foo.BAR)');
					expect(typeof QUX).toBe('symbol');
					expect(String(QUX)).toBe('Symbol(foo.QUX)');
				});

				it('caches symbols', () => {
					const args1 = createArgs(['BAR']);
					const plugin1 = new Plugin(...args1);

					const args2 = createArgs(['BAR']);
					const plugin2 = new Plugin(...args2);

					expect(typeof plugin1.BAR).toBe('symbol');
					expect(typeof plugin2.BAR).toBe('symbol');
					expect(plugin1.BAR).toBe(plugin2.BAR);
				});
			});
		}
	});
});

function makeCreateArgsFn(argsStr) {
	// eslint-disable-next-line no-eval
	return eval(`(name, version, extend, symbols) => [${argsStr}]`);
}

function makeArgStrings(names) {
	// Make all possible orders of arg names
	let iterations = [[]];
	for (let i = 0; i < names.length; i++) {
		iterations = flatMap(iterations, args => (
			names.filter(name => !args.find(arg => arg.name === name))
				.map(name => args.concat([{name}]))
		));
	}

	// Add all possible combinations of arg names
	const ARG = 0,
		PROP = 1,
		PROP_JOINED = 2;
	const ARG_TYPES = [ARG, PROP, PROP_JOINED];

	for (let i = 0; i < names.length; i++) {
		iterations = flatMap(iterations, args => (
			ARG_TYPES.map((type) => {
				const listCloned = args.map(arg => ({...arg}));
				listCloned[i].type = type;
				return listCloned;
			})
		));
	}

	// Filter out invalid combinations
	const prioritiesMap = {};
	names.forEach((arg, index) => { prioritiesMap[arg] = index; });

	iterations = iterations.filter((args) => {
		// PROP_JOINED type cannot be first or follow ARG
		let lastType = ARG;
		for (const {type} of args) {
			if (type === PROP_JOINED && lastType === ARG) return false;
			lastType = type;
		}

		// `name` can only be string if is first arg
		// `version` can only be string if is 2nd arg and after `name` as string
		if (names.includes('name')) {
			const namePos = args.findIndex(arg => arg.name === 'name'),
				nameType = args[namePos].type;
			if (nameType === ARG && namePos !== 0) return false;

			const versionPos = args.findIndex(arg => arg.name === 'version'),
				versionType = args[versionPos].type;
			if (versionType === ARG && (versionPos !== 1 || nameType !== ARG)) return false;
		}

		// `symbols` can only be an object prop
		if (names.includes('symbols')) {
			const symbolsType = args.find(arg => arg.name === 'symbols').type;
			if (symbolsType === ARG) return false;
		}

		// Eliminate objects where props not in priority order
		// i.e. Don't need to test both `{name, version}` and `{version, name}`
		let lastPriority = 0;
		for (const arg of args) {
			const {type} = arg;
			if (type === ARG) {
				lastPriority = 0;
				continue;
			}

			const priority = prioritiesMap[arg.name];
			if (arg.type === PROP_JOINED && priority < lastPriority) return false;

			lastPriority = priority;
		}

		return true;
	});

	// Convert to argument strings
	return iterations.map((args) => {
		// Assemble argument string
		let lastPart = null;
		const parts = flatMap(args, ({name, type}) => {
			if (type === ARG) {
				lastPart = null;
				return [name];
			}

			if (type === PROP || !lastPart) {
				const part = [name];
				lastPart = part;
				return [part];
			}

			lastPart.push(name);
			return [];
		});

		return parts.map((part) => {
			if (!isArray(part)) return part;
			return `{${part.join(', ')}}`;
		}).join(', ');
	});
}
