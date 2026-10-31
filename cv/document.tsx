/** @jsxImportSource react */
import type { ReactNode } from 'react'
import { PdfIcon } from './icon'
import resume from './resume.json'
import presentation from './presentation.json'
import { workDateText } from './format'
import { standardFonts } from '@formepdf/fonts-standard'
import { ATTACHMENT_NOTE } from './lib/resume'
import type { IconName } from './lib/icons'
import {
  Document,
  Fixed,
  Cell,
  Page as PdfPage,
  QrCode,
  Row,
  Table,
  Text,
  View,
  type Style,
} from '@formepdf/react'

type WorkItem = {
  position: string
  company: string
  startDate: string
  endDate: string | null
  location: string
  remote?: boolean
  highlights: string[]
}

const visibleSkills = [
  {
    "name": "Languages",
    "keywords": [
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "SCSS",
      "SQL",
      "Kotlin",
      "Java",
      "C",
      "Gleam"
    ]
  },
  {
    "name": "Frontend",
    "keywords": [
      "React",
      "Next.js",
      "Vue",
      "Nuxt",
      "Astro",
      "Tailwind CSS",
      "React Query",
      "Redux"
    ]
  },
  {
    "name": "Tools & Testing",
    "keywords": [
      "Storybook",
      "Git",
      "Vite",
      "Vitest",
      "Playwright",
      "CI/CD",
      "Integration testing"
    ]
  },
  {
    "name": "Backend & Platforms",
    "keywords": [
      "Node.js",
      "Cloudflare Workers",
      "PostgreSQL",
      "Docker",
      "REST APIs"
    ]
  }
]

const BLACK = '#000000'
const GRAY = '#374151'
const LIGHT_GRAY = '#d1d5db'
const PAGE_GAP = 16

function SectionTitle({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 15 }}>
      {icon && (
        <View style={{ position: 'relative', top: 2, width: 15, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <PdfIcon name={icon} size={15} />
        </View>
      )}
      <Text style={{ fontSize: 15, fontWeight: 700 }}>{children}</Text>
    </View>
  )
}

function Header() {
  const url = 'https://avdeyev.dev'
  const contactStyle: Style = { flexDirection: 'row', alignItems: 'center', gap: 6 }
  const contactIconStyle: Style = { position: 'relative', top: 1.5, width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, paddingBottom: 12 }}>
      <View style={{ flexGrow: 1, marginTop: -12 }}>
        <Text style={{ fontSize: 27, fontWeight: 700, marginBottom: 9 }}>Ivan Avdeyev</Text>
        <Text style={{ fontSize: 15, color: GRAY, fontWeight: 500, marginBottom: 18 }}>Frontend Developer</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 9 }}>
          <View style={contactStyle} href="mailto:contact@avdeyev.dev">
            <View style={contactIconStyle}>
              <PdfIcon name="mail-line" size={12} />
            </View>
            <Text style={{ fontSize: 10 }}>contact@avdeyev.dev</Text>
          </View>
          <View style={contactStyle} href={url}>
            <View style={contactIconStyle}>
              <PdfIcon name="link" size={12} />
            </View>
            <Text style={{ fontSize: 10 }}>avdeyev.dev</Text>
          </View>
          <View style={contactStyle} href="https://github.com/eone666">
            <View style={contactIconStyle}>
              <PdfIcon name="github-line" size={12} />
            </View>
            <Text style={{ fontSize: 10 }}>eone666</Text>
          </View>
          <View style={contactStyle} href="https://t.me/eone666">
            <View style={contactIconStyle}>
              <PdfIcon name="telegram-2-line" size={12} />
            </View>
            <Text style={{ fontSize: 10 }}>eone666</Text>
          </View>
        </View>
      </View>
      <View style={{ padding: 9, border: `1.5 solid ${BLACK}` }}>
        <QrCode data={url} size={67.5} />
      </View>
    </View>
  )
}

const work: WorkItem[] = presentation.work.map(item => {
  const job = resume.work.find(job => job.name === item.name)!
  return { ...job, company: job.name, endDate: job.endDate ?? null, location: job.location, highlights: item.highlights }
})

function WorkExperience({ items, title = false }: { items: WorkItem[]; title?: boolean }) {
  return (
    <View style={title ? { marginTop: 4 } : undefined}>
      {title && <SectionTitle icon="briefcase-2-line">Work Experience</SectionTitle>}
      <View style={{ gap: 10 }}>
        {items.map((item) => (
          <View key={`${item.company}-${item.startDate}`} wrap={false} style={{ borderLeft: `1.5 solid ${BLACK}`, paddingLeft: 18, paddingRight: 12, paddingTop: 8, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
              <View style={{ flexGrow: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: 700 }}>{item.position}</Text>
                <Text style={{ fontSize: 10, color: GRAY, fontWeight: 500 }}>{item.company} · {item.location}</Text>
              </View>
              <View wrap={false} style={{ height: 22, border: `0.75 solid ${BLACK}`, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: 600, position: 'relative', top: -1.5 }}>{workDateText(item.startDate)}–{workDateText(item.endDate)}</Text>
              </View>
            </View>
            <View style={{ gap: 6 }}>
              {item.highlights.map((highlight) => (
                <View key={highlight} style={{ flexDirection: 'row', gap: 6 }}>
                  <Text style={{ fontSize: 10 }}>•</Text>
                  <Text style={{ fontSize: 10, flexGrow: 1 }}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

function SkillsBlock({ title, skills }: { title: string; skills: string[] }) {
  return (
    <View wrap={false} style={{ padding: 12, border: `1.5 solid ${BLACK}` }}>
      <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 9 }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {skills.map((skill) => (
          <View key={skill} style={{ border: `0.75 solid ${LIGHT_GRAY}`, paddingHorizontal: 5, paddingVertical: 2 }}>
            <Text style={{ fontSize: 9, fontWeight: 500 }}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function SelectedProjects() {
  const projects = presentation.projects
  return (
    <View wrap={false}>
      <SectionTitle icon="apps-line">Selected Projects</SectionTitle>
      <Table
        columns={[{ width: { fraction: 0.26 } }, { width: { fraction: 0.74 } }]}
        style={{ width: '100%' }}
      >
        {projects.map((project) => (
          <Row key={project.name}>
            <Cell style={{ paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text href={project.url} style={{ color: BLACK, fontSize: 10, fontWeight: 700 }}>
                {project.name}
              </Text>
            </Cell>
            <Cell style={{ paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10 }}>{project.description}</Text>
            </Cell>
          </Row>
        ))}
      </Table>
    </View>
  )
}

function PageNumber({ children, profileLink = false }: { children: ReactNode; profileLink?: boolean }) {
  return <Fixed position="footer" style={{ fontFamily: 'Liberation Mono' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flexGrow: 1 }}>
        {profileLink && <Text style={{ fontSize: 7 }}>{ATTACHMENT_NOTE}</Text>}
      </View>
      <Text style={{ fontSize: 9 }}>{children}</Text>
    </View>
  </Fixed>
}

export default (
  <Document
    title="Ivan Avdeyev | CV"
    author="Ivan Avdeyev"
    subject={`${resume.basics.summary} ${ATTACHMENT_NOTE}`}
    creator="Forme"
    lang="en"
    tagged
    pdfa="3u"
    fonts={standardFonts()}
    style={{ fontFamily: 'Liberation Mono', fontSize: 10, color: BLACK }}
  >
    <PdfPage size="A4" margin={34} style={{ gap: 10, backgroundColor: '#ffffff' }}>
      <Header />
      <View>
        <View style={{ position: 'relative', top: -7 }}>
          <SectionTitle icon="user-3-line">Professional Summary</SectionTitle>
          <Text style={{ fontSize: 10, lineHeight: 1.625 }}>
          Frontend developer building web and mobile interfaces, reusable UI systems, and data-rich applications. I work across frameworks and learn the tools a project needs, with experience extending into APIs, data preparation, and performance optimization. I value maintainable code, thoughtful UX, and understanding how things work under the hood.
          </Text>
        </View>
      </View>
      <WorkExperience items={work.slice(0, 3)} title />
      <PageNumber>1</PageNumber>
    </PdfPage>

    <PdfPage size="A4" margin={34} style={{ gap: PAGE_GAP, backgroundColor: '#ffffff' }}>
      <View>
        <SectionTitle icon="graduation-cap-line">Education</SectionTitle>
        <View wrap={false} style={{ borderLeft: `1.5 solid ${BLACK}`, paddingLeft: 18, paddingRight: 12, paddingVertical: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
            <View style={{ flexGrow: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: 700 }}>1305000 - Information Systems</Text>
              <Text style={{ fontSize: 10, color: GRAY, fontWeight: 500 }}>Eastern Technical and Humanities College · Oskemen, KZ</Text>
            </View>
            <View wrap={false} style={{ height: 22, border: `0.75 solid ${BLACK}`, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: 600, position: 'relative', top: -1.5 }}>2016–2020</Text>
            </View>
          </View>
          <Text style={{ fontSize: 10 }}>Vocational · 1305023 - Software Technician, 1305011 - Designer</Text>
        </View>
      </View>

      <View>
        <SectionTitle icon="tools-line">Technical Skills</SectionTitle>
        <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch', gap: 12 }}>
          {visibleSkills.map((group) => <SkillsBlock key={group.name} title={group.name} skills={group.keywords} />)}
          <SkillsBlock title="Rendering & Performance" skills={['SSR', 'SSG', 'ISR', 'Media optimization', 'Web performance', 'Code splitting']} />
          <SkillsBlock title="Concepts & Processes" skills={['Agile', 'Scrum', 'Architecture', 'Software Design', 'UX', 'SEO']} />
        </View>
      </View>

      <SelectedProjects />
      <View wrap={false}>
        <SectionTitle>Languages</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 15, borderLeft: `1.5 solid ${BLACK}`, paddingLeft: 18, paddingRight: 12, paddingVertical: 12 }}>
          <Text style={{ fontSize: 10 }}>Russian – Native</Text>
          <Text style={{ fontSize: 10 }}>·</Text>
          <Text style={{ fontSize: 10 }}>English – Intermediate</Text>
        </View>
      </View>
      <PageNumber profileLink>2</PageNumber>
    </PdfPage>
  </Document>
)
