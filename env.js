// eslint-disable-next-line @typescript-eslint/no-var-requires
const zod = require("zod");

const envSchema = zod.object({
  ANALYZE: zod.string(),
});

module.exports = envSchema.parse(process.env);
