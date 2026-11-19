import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const authArguments = process.argv.slice(2);
if (authArguments[0] === "migrate" && !authArguments.includes("--yes")) {
  authArguments.push("--yes");
}
const result = spawnSync(command, ["--yes", "auth@latest", ...authArguments], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
