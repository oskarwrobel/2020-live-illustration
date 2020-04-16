module.exports = {
	preset: 'ts-jest',
	moduleFileExtensions: [
		'ts', 'js'
	],
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	testMatch: [
		'**/test/**/*.ts'
	],
	moduleNameMapper: {
		'^lodash-es$': 'lodash'
	}
};
