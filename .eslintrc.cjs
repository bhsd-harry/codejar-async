/* eslint-env node */
'use strict'

const config = require('@bhsd/common/eslintrc.browser.cjs')
const {plugins, rules, overrides} = config
const [
	json,
	ts,
] = overrides

for (const key in rules) {
	if (key.startsWith('jsdoc/')) {
		delete rules[key]
	}
}

module.exports = {
	...config,
	plugins: plugins.filter(plugin => plugin !== 'jsdoc'),
	rules: {
		...rules,
		'arrow-body-style': 0,
		'consistent-return': 0,
		curly: 0,
		eqeqeq: 0,
		'logical-assignment-operators': 0,
		'new-cap': [
			2,
			{
				capIsNew: false,
			},
		],
		'no-param-reassign': 0,
		'no-sequences': 0,
		'no-underscore-dangle': 0,
		'no-useless-escape': 0,
		'no-void': 0,
		'prefer-template': 0,
		'require-unicode-regexp': 0,
		'@stylistic/indent': [
			2,
			2,
		],
		'@stylistic/indent-binary-ops': 0,
		'@stylistic/max-len': 0,
		'@stylistic/no-extra-parens': 0,
		'@stylistic/one-var-declaration-per-line': 0,
		'@stylistic/quotes': 0,
		'@stylistic/semi': [
			2,
			'never',
		],
		'regexp/no-useless-escape': 0,
		'regexp/prefer-d': 0,
		'regexp/prefer-regexp-exec': 0,
		'unicorn/consistent-function-scoping': 0,
		'unicorn/no-lonely-if': 0,
		'unicorn/no-negated-condition': 0,
		'unicorn/prefer-code-point': 0,
	},
	overrides: [
		{
			...json,
			rules: {
				...json.rules,
				'comma-dangle': 0,
				'@stylistic/indent': [
					2,
					'tab',
				],
			},
		},
		{
			...ts,
			rules: {
				...ts.rules,
				'prefer-const': 0,
				'@typescript-eslint/ban-ts-comment': 0,
				'@typescript-eslint/consistent-type-definitions': 0,
				'@typescript-eslint/explicit-function-return-type': 0,
				'@typescript-eslint/no-explicit-any': 0,
				'@typescript-eslint/no-invalid-void-type': 0,
				'@typescript-eslint/no-redeclare': 0,
				'@typescript-eslint/no-shadow': [
					2,
					{
						builtinGlobals: false,
					},
				],
				'@typescript-eslint/no-unnecessary-condition': 0,
				'@typescript-eslint/no-unsafe-argument': 0,
				'@typescript-eslint/no-unsafe-member-access': 0,
				'@typescript-eslint/no-unused-expressions': 0,
				'@typescript-eslint/no-unused-vars': [
					2,
					{
						argsIgnorePattern: '^_',
					},
				],
				'@typescript-eslint/only-throw-error': 0,
				'@typescript-eslint/prefer-destructuring': 0,
				'@stylistic/member-delimiter-style': [
					2,
					{
						multiline: {
							delimiter: 'none',
						},
					},
				],
			},
		},
		{
			files: '.eslintrc.cjs',
			rules: {
				'@stylistic/indent': [
					2,
					'tab',
				],
			},
		},
	],
}
