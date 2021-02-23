const fs = require("fs");
const _ = require("lodash");
const resolve = require("path").resolve;
const schemaBuilder = require("typescript-json-schema");

fs.readdir(__dirname, (err, files) => {
  files
    .filter((f) => f.toLowerCase().endsWith(".ts"))
    .forEach((file) => {
      const domainName = _.startCase(_.trimEnd(file, ".ts")).replace(" ", "");
      const builder = schemaBuilder.getProgramFromFiles([resolve(__dirname + "/" + file)]);
      const settings = { required: true, noExtraProps: true };
      const schema = schemaBuilder.generateSchema(builder, domainName, settings);
      fs.writeFile(__dirname + "/" + _.trimEnd(file, ".ts") + ".schema.json", JSON.stringify(schema, null, 2), () => {});
    });
});
