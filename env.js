// eslint-disable-next-line @typescript-eslint/no-var-requires
const zod = require("zod");

const envSchema = zod.object({
  ANALYZE: zod.enum(["true", "false"]).or(zod.undefined()),
});

module.exports = envSchema.parse(process.env);
