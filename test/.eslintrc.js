/* --------------------
 * @overlook/plugin module
 * Tests ESLint config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	extends: [
		'@overlookmotel/eslint-config-jest'
	],
	rules: {
		'import/no-unresolved': ['error', {ignore: ['^@overlook/plugin$']}],
		'node/no-missing-require': ['error', {allowModules: ['@overlook/plugin']}]
	}
};
