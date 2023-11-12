"use strict";

/* eslint-env node */

import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import svgo from "vite-plugin-svgo";

export default defineConfig({
  base: process.env.base ?? "/",
  test: {
    environment: "jsdom",
  },
  plugins: [
    createHtmlPlugin({
      entry: "/src/index.ts",
      template: "public/index.html",
    }),
    svgo({
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              convertShapeToPath: false,
              collapseGroups: false,
            },
          },
        },
        {
          name: "prefixIds",
          params: {
            prefixIds: false,
            prefixClassNames: true,
          },
        },
      ],
    }),
  ],
  define: {
    ANALYTICS: JSON.stringify(process.env.analytics),
  },
});
