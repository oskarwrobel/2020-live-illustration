'use strict';

/* eslint-env node */

const path = require( 'path' );
const { DefinePlugin } = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = ( env = {} ) => {
	const projectDir = path.dirname( __filename );
	const entry = [ path.join( projectDir, 'src', 'app.ts' ) ];

	if ( env.analytics ) {
		entry.push( path.join( projectDir, 'src', 'analytics.js' ) );
	}

	return {
		entry,

		output: {
			filename: '[name].[contenthash].js',
			path: path.join( process.cwd(), 'dist' ),
			publicPath: '/'
		},

		context: path.resolve( projectDir ),

		resolve: {
			extensions: [ '.ts' ]
		},

		module: {
			rules: [
				{
					test: /\.(js|ts)$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'ts-loader',
							options: {
								context: projectDir
							}
						}
					]
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
					test: /.(png|jpg|jpeg|gif)$/,
					use: 'file-loader'
				},
				{
					test: /.(svg)$/,
					use: 'svg-inline-loader'
				},
				{
					test: /\.html$/,
					use: {
						loader: 'html-loader'
					}
				}
			]
		},

		plugins: [
			new HtmlWebpackPlugin( {
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
