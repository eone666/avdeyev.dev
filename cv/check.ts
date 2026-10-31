import assert from 'node:assert/strict'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRawStream, decodePDFRawStream } from 'pdf-lib'
import resume from './resume.json'
import presentation from './presentation.json'
import { workDateText } from './format'
import { ATTACHMENT_NOTE } from './lib/resume'
import { validateResume } from './lib/resume-validation'

/** Inspect the rendered file using an independent PDF parser, not layout metadata. */
export async function checkCv(pdfBytes: Uint8Array, expectedResume: string) {
  const pdf = await getDocument({ data: pdfBytes.slice(), useSystemFonts: true, isEvalSupported: false, verbosity: 0 }).promise
  try {
    const texts: string[] = []
    const links: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      texts.push(content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' '))
      const annotations = await page.getAnnotations()
      assert.equal(texts[i - 1].includes(ATTACHMENT_NOTE), i === pdf.numPages, 'AI attachment note must appear only on the final page')
      for (const annotation of annotations) {
        if (annotation.url) links.push(annotation.url)
      }
    }
    const text = texts.join(' ')
    assert.ok(text.includes(resume.basics.name), 'Candidate name missing from text layer')
    assert.ok(text.includes(resume.basics.email), 'Email missing from text layer')
    const github = resume.basics.profiles.find(item => item.network === 'GitHub')
    assert.ok(github && texts[0].includes(github.username), 'GitHub username missing from first page')
    assert.ok(links.includes(github.url), 'GitHub profile link missing from PDF')
    assert.ok(links.includes('https://t.me/eone666'), 'Telegram contact link missing from PDF')
    for (const heading of ['Professional Summary', 'Work Experience', 'Education', 'Technical Skills', 'Selected Projects']) {
      assert.ok(text.includes(heading), `Missing heading: ${heading}`)
    }
    let previousJob = -1
    for (const visible of presentation.work) {
      const job = resume.work.find(item => item.name === visible.name)!
      const company = text.indexOf(job.name)
      assert.ok(company > previousJob, `Work history reading order is incorrect: ${job.name}`)
      const date = `${workDateText(job.startDate)}–${workDateText(job.endDate ?? null)}`
      assert.ok(text.indexOf(date, company) > company, `Dates missing after company: ${job.name}`)
      for (const highlight of visible.highlights) assert.ok(text.includes(highlight), `Missing work highlight: ${highlight}`)
      previousJob = company
    }
    for (const selected of presentation.projects) {
      assert.ok(text.includes(selected.name), `Missing project: ${selected.name}`)
      assert.ok(links.includes(new URL(selected.url).href), `Missing project link: ${selected.name}`)
    }
    const files = await pdf.getAttachments()
    assert.ok(files, 'PDF attachments missing')
    assert.deepEqual(Object.keys(files), ['resume.json'])
    const decoder = new TextDecoder()
    assert.equal(decoder.decode(files['resume.json']?.content), expectedResume)
    validateResume(JSON.parse(decoder.decode(files['resume.json'].content)))
  } finally {
    await pdf.destroy()
  }
  const structure = await PDFDocument.load(pdfBytes, { updateMetadata: false })
  assert.ok(structure.catalog.has(PDFName.of('StructTreeRoot')), 'Tagged PDF structure missing')
  const associated = structure.catalog.lookup(PDFName.of('AF'), PDFArray)
  assert.equal(associated.size(), 1)
  const expectedRelationships: Record<string, string> = { 'resume.json': '/Alternative' }
  for (const ref of associated.asArray()) {
    const file = structure.context.lookup(ref, PDFDict)
    const name = file.get(PDFName.of('F'))
    assert.ok(name && 'decodeText' in name)
    const filename = (name as { decodeText(): string }).decodeText()
    assert.equal(file.get(PDFName.of('AFRelationship'))?.toString(), expectedRelationships[filename])
    const stream = structure.context.lookup(file.lookup(PDFName.of('EF'), PDFDict).get(PDFName.of('F')))
    assert.ok(stream instanceof PDFRawStream)
    assert.equal(stream.dict.get(PDFName.of('Subtype'))?.toString(), '/application#2Fjson')
  }
  const metadata = structure.context.lookup(structure.catalog.get(PDFName.of('Metadata')))
  assert.ok(metadata instanceof PDFRawStream)
  const xmp = new TextDecoder().decode(decodePDFRawStream(metadata).decode())
  assert.match(xmp, /pdfaid:part[^>]*>3</)
  assert.match(xmp, /pdfaid:conformance[^>]*>U</)
}
