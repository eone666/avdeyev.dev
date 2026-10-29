import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from '../cv/json-resume.schema.json'

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)
// The upstream schema permits arbitrary extensions. Our source deliberately
// restricts objects to documented JSON Resume fields for interoperability.
const documentedFieldsSchema = structuredClone(schema)
function restrictFields(node: unknown) {
  if (!node || typeof node !== 'object') return
  const object = node as Record<string, unknown>
  if (object.type === 'object' && object.properties) object.additionalProperties = false
  for (const value of Object.values(object)) restrictFields(value)
}
restrictFields(documentedFieldsSchema)
documentedFieldsSchema.$id = 'urn:avdeyev:json-resume-documented-fields'
const validateDocumentedFields = ajv.compile(documentedFieldsSchema)

export function validateResume(value: unknown) {
  if (!validate(value)) throw new Error(`Invalid JSON Resume: ${ajv.errorsText(validate.errors)}`)
  if (!validateDocumentedFields(value)) throw new Error(`Undocumented JSON Resume fields: ${ajv.errorsText(validateDocumentedFields.errors)}`)
}
