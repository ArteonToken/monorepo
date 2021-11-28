import json from  '@rollup/plugin-json'
import { execSync } from 'child_process'

execSync('rm -rf www/*.js')
execSync('cp -rf ./../addresses/addresses/**.js www/addresses')


export default [
	{
		input: ['src/shell.js', 'src/views/market.js', 'src/views/list.js', 'src/views/home.js', 'src/api/api.js'],
		output: {
			dir: 'www',
			format: 'es',
			sourcemap: false
		},
		plugins: [json()],
		external: [
			'./api.js',
			'./third-party/ethers.js',
			'./third-party/WalletConnectClient.js'
		]
	},
	{
		input: ['src/themes/default.js'],
		output: {
			dir: 'www/themes',
			format: 'es'
		}
	}
];
