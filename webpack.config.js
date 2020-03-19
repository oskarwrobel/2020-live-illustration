'use strict';

/* eslint-env node */

const path = require( 'path' );
const { DefinePlugin } = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = ( env = {} ) => {
	const projectDir = path.dirname( __filename );
	const main = [ path.join( projectDir, 'src', 'scripts', 'app.ts' ) ];

	if ( env.analytics ) {
		main.push( path.join( projectDir, 'src', 'scripts', 'analytics.js' ) );
	}

	return {
		entry: { main },

		output: {
			filename: '[name].[contenthash].js',
			path: path.join( process.cwd(), 'dist' ),
			publicPath: '/'
		},

		resolve: {
			// Add `.ts` and `.tsx` as a resolvable extension.
			extensions: [ '.ts' ]
		},

		module: {
			rules: [

				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'ts-loader'
						}
					]
				},
				// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
				{
					enforce: 'pre',
					test: /\.js$/,
					loader: 'source-map-loader'
				},
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								map: false,
								plugins: () => [
									require( 'postcss-nested' )
								]
							}
						}
					]
				},
				{
					test: /.(png|jpg|jpeg|gif|svg)$/,
					use: 'file-loader'
				},
				{
					test: /\.html$/,
					use: {
						loader: 'html-loader',
						options: {
							interpolate: true
						}
					}
				}
			]
		},

		plugins: [
			new HtmlWebpackPlugin( {
				chunks: [ 'main' ],
				template: path.join( projectDir, 'src', 'index.html' ),
				filename: '2020.html'
			} ),
			new MiniCssExtractPlugin( {
				filename: '[name].[contenthash].css'
			} ),
			new DefinePlugin( {
				ANALYTICS: JSON.stringify( env.analytics )
			} )
		]
	};
};
