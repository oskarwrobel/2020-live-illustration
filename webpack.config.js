"use strict";

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env = {}, argv = {}) => {
  const isProduction = argv.mode === "production";

  const projectDir = path.dirname(__filename);
  const staticDir = path.join(process.cwd(), "dist");
  const entry = [path.join(projectDir, "src", "app.ts")];

  if (env.analytics) {
    entry.push(path.join(projectDir, "src", "analytics.js"));
  }

  return {
    entry,

    output: {
      filename: "[name].[contenthash].js",
      path: staticDir,
      publicPath: "/",
      clean: true,
    },

    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 8000,
    },

    context: path.resolve(projectDir),

    resolve: {
      extensions: [".ts", ".js", ".svg"],
      modules: ["src", "node_modules"],
    },

    devtool: !isProduction ? "inline-source-map" : false,

    module: {
      rules: [
        {
          test: /\.(js|ts)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                context: projectDir,
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [require("postcss-nesting")()],
                },
              },
            },
          ],
        },
        {
          test: /.(png|jpg|jpeg|gif|ttf)$/,
          type: "asset/resource",
        },
        {
          test: /.(svg)$/,
          use: "svg-inline-loader?classPrefix=_[contenthash:3]-",
        },
        {
          test: /\.html$/,
          use: {
            loader: "html-loader",
          },
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(projectDir, "src", "index.html"),
        filename: "2020.html",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(projectDir, "src", "assets", "2020-og-image.png"),
            to: path.join(process.cwd(), "dist"),
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      new DefinePlugin({
        ANALYTICS: JSON.stringify(env.analytics),
      }),
    ],
  };
};
