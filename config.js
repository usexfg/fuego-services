import commandLineArgs from "command-line-args";
import path from "path";
import fs from "graceful-fs";


const cmdOptions = commandLineArgs([{
  name: "config",
  alias: "c",
  type: String
}]);

// Determine config file path: use provided path, default to config.json, or fallback to sample
const defaultConfigPath = cmdOptions.config || path.join(process.cwd(), "config.json");
const sampleConfigPath = path.join(process.cwd(), "config.json.sample");
const configPath = fs.existsSync(defaultConfigPath) ? defaultConfigPath : sampleConfigPath;
export default JSON.parse(fs.readFileSync(configPath, "utf8"));