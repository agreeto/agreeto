const rootConfig = require("../../prettier.config.cjs")

/** @type {import('prettier').Options} */
module.exports = {
  ...rootConfig,
  plugins: [
    ...rootConfig.plugins,
    require.resolve("@plasmohq/prettier-plugin-sort-imports")
  ],
  importOrder: [
    "@fullcalendar/react(.*)$",
    "@fullcalendar/(.*)$",
    "^@plasmohq/(.*)$",
    "^~(.*)$",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
}
