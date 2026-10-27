import { renderDocumentWithLayout } from '@formepdf/core'
import document from './document'
import profile from './profile.json'
import { jsonResume } from '../shared/resume'
import { validateResume } from '../shared/resume-validation'

export async function renderCv() {
  const resume = jsonResume()
  validateResume(resume)
  const profileJson = JSON.stringify(profile, null, 2) + '\n'
  const resumeJson = JSON.stringify(resume, null, 2) + '\n'
  const result = await renderDocumentWithLayout(document, {
    auditContent: true,
    attachments: [
      { name: 'profile.json', data: profileJson, mimeType: 'application/json', relationship: 'Supplement', description: 'Extended professional profile with experience, skills, and project sources.' },
      { name: 'resume.json', data: resumeJson, mimeType: 'application/json', relationship: 'Alternative', description: 'JSON Resume export.' },
    ],
  })
  if (result.warnings.length) throw new Error(`CV rendering warnings:\n${result.warnings.join('\n')}`)
  return { ...result, profileJson, resumeJson }
}
