const path = require("path");
require("ts-node").register({ transpileOnly: true, project: path.join(__dirname, "../tsconfig.json") });
const app = require(path.join(__dirname, "../src/app")).default;
module.exports = app;