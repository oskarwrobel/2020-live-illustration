'use strict';

/* eslint-env node */

const path = require( 'path' );
const { DefinePlugin } = require( 'webpack' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = ( env = {}, argv = {} ) => {
	const isProduction = argv.mode === 'production';

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

		devtool: !isProduction ? 'inline-source-map' : false,

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
									require( 'postcss-nested' )(),
									isProduction ? require( 'cssnano' )() : noop
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
					use: 'svg-inline-loader?classPrefix=_[contenthash:3]-'
				},
				{
					test: /\.html$/,
					use: {
						loader: 'html-loader',
						options: {
							attributes: {
								list: [
									{
										tag: 'img',
										attribute: 'src',
										type: 'src'
									},
									{
										tag: 'link',
										attribute: 'href',
										type: 'src'
									}
								]
							}
						}
					}
				}
			]
		},

		plugins: [
			!isProduction ? new CleanWebpackPlugin( {
				verbose: false
			} ) : noop,
			new HtmlWebpackPlugin( {
				template: path.join( projectDir, 'src', 'index.html' ),
				filename: '2020.html'
			} ),
			new CopyPlugin( [
				{
					from: path.join( process.cwd(), 'src', 'og-image.png' ),
					to: path.join( process.cwd(), 'dist', '2020-og-image.png' )
				}
			] ),
			new MiniCssExtractPlugin( {
				filename: '[name].[contenthash].css'
			} ),
			new DefinePlugin( {
				ANALYTICS: JSON.stringify( env.analytics )
			} )
		]
	};
};

function noop() {}
