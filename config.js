import commandLineArgs from "command-line-args";
import path from "path";
import fs from "graceful-fs";


const cmdOptions = commandLineArgs([{
  name: "config",
  alias: "c",
  type: String
}]);

export default JSON.parse(fs.readFileSync(cmdOptions.config || path.join(process.cwd(), "config.json"), "utf8"));