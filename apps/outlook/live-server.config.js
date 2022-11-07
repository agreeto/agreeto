/* eslint-disable @typescript-eslint/no-var-requires */
var fs = require("fs");
var os = require("os");
var path = require("path");

/**
 * @type {import('tls').SecureContextOptions}
 */

const config = {
  // note (richard): I was unable to use the const from the vite plugin directly: https://github.com/liuweiGL/vite-plugin-mkcert/issues/20#issuecomment-1212197019
  cert: fs.readFileSync(
    path.join(os.homedir(), ".vite-plugin-mkcert", "certs", "dev.pem")
  ),
  key: fs.readFileSync(
    path.join(os.homedir(), ".vite-plugin-mkcert", "certs", "dev.key")
  ),
};

module.exports = config;
