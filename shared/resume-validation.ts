import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from '../cv/json-resume.schema.json'

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)

export function validateResume(value: unknown) {
  if (!validate(value)) throw new Error(`Invalid JSON Resume: ${ajv.errorsText(validate.errors)}`)
}
