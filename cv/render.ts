import { renderDocumentWithLayout } from '@formepdf/core'
import document from './document'
import { jsonResume } from '../shared/resume'
import { validateResume } from '../shared/resume-validation'

export async function renderCv() {
  const resume = jsonResume()
  validateResume(resume)
  const resumeJson = JSON.stringify(resume, null, 2) + '\n'
  const result = await renderDocumentWithLayout(document, {
    auditContent: true,
    attachments: [
      { name: 'resume.json', data: resumeJson, mimeType: 'application/json', relationship: 'Alternative', description: 'JSON Resume export.' },
    ],
  })
  if (result.warnings.length) throw new Error(`CV rendering warnings:\n${result.warnings.join('\n')}`)
  return { ...result, resumeJson }
}
