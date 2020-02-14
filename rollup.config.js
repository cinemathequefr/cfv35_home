import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
// import postcss from "postcss";
// import postcssImport from "postcss-import";
// import postcssPresetEnv from "postcss-preset-env";
// import lost from "lost";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "docs/js/bundle.js"
  },
  plugins: [
    svelte({
      dev: !production,
      // preprocess: {
      //   style: ({ content, attributes }) => {
      //     if (attributes.type !== "text/postcss") {
      //       return;
      //     }

      //     return postcss([postcssImport, lost, postcssPresetEnv])
      //       .process(content, {
      //         from: "src",
      //         map: {
      //           inline: false
      //         }
      //       })
      //       .then(result => ({
      //         code: result.css.toString(),
      //         map: result.map.toString()
      //       }));
      //   }
      // },
      css: css => {
        css.write("docs/css/bundle.css");
      }
      // emitCss: true
    }),
    resolve({
      browser: true
    }),
    commonjs(),

    !production && livereload("docs"),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
