"use strict";

import terser from "@rollup/plugin-terser";
const JsPath = "src/firefox.min/background.js";

export default {
    input: [JsPath],
    output: {
        file: JsPath,
        format: 'es',
    },
    plugins: [terser(),],
};