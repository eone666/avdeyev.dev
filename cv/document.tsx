/** @jsxImportSource react */
import type { ReactNode } from 'react'
import { PdfIcon } from './icon'
import profile from './profile.json'
import type { IconName } from '../shared/icons'
import {
  Document,
  Cell,
  Page as PdfPage,
  QrCode,
  Row,
  Table,
  Text,
  View,
  type Style,
} from '@formepdf/react'

type Location = {
  city?: string
  countryCode?: string
  label?: string
}

type WorkItem = {
  position: string
  company: string
  startDate: string
  endDate: string
  location: Location
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
      "SQL"
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
      "Playwright"
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
const PAGE_GAP = 12

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

function locationText(location: Location) {
  if (location.label) return location.label
  return [location.city, location.countryCode].filter(Boolean).join(', ')
}

function Header() {
  const url = 'https://avdeyev.dev'
  const location = 'Almaty, KZ'
  const contactStyle: Style = { flexDirection: 'row', alignItems: 'center', gap: 6 }
  const contactIconStyle: Style = { position: 'relative', top: 1.5, width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, paddingBottom: 12 }}>
      <View style={{ flexGrow: 1, marginTop: -12 }}>
        <Text style={{ fontSize: 27, fontWeight: 700, marginBottom: 9 }}>Ivan Avdeyev</Text>
        <Text style={{ fontSize: 15, color: GRAY, fontWeight: 500, marginBottom: 18 }}>Frontend Developer</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 9 }}>
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
          <View style={contactStyle} href={`https://www.google.com/maps/search/?api=1&query=${location}`}>
            <View style={contactIconStyle}>
              <PdfIcon name="map-pin-line" size={12} />
            </View>
            <Text style={{ fontSize: 10 }}>{location}</Text>
          </View>
        </View>
      </View>
      <View style={{ padding: 9, border: `1.5 solid ${BLACK}` }}>
        <QrCode data={url} size={67.5} />
      </View>
    </View>
  )
}

const work: WorkItem[] = profile.work

function WorkExperience({ items, title = false }: { items: WorkItem[]; title?: boolean }) {
  return (
    <View style={title ? { marginTop: 4 } : undefined}>
      {title && <SectionTitle icon="briefcase-2-line">Work Experience</SectionTitle>}
      <View style={{ gap: 12 }}>
        {items.map((item) => (
          <View key={`${item.company}-${item.startDate}`} wrap={false} style={{ borderLeft: `1.5 solid ${BLACK}`, paddingLeft: 18, paddingRight: 12, paddingTop: 8, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
              <View style={{ flexGrow: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: 700 }}>{item.position}</Text>
                <Text style={{ fontSize: 10, color: GRAY, fontWeight: 500 }}>{item.company} · {locationText(item.location)}</Text>
              </View>
              <View wrap={false} style={{ height: 22, border: `0.75 solid ${BLACK}`, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: 600 }}>{item.startDate}–{item.endDate}</Text>
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
  const projects = profile.selectedProjects
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

function PageNumber({ children }: { children: ReactNode }) {
  return <Text style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: 9, textAlign: 'center' }}>{children}</Text>
}

export default (
  <Document
    title="Ivan Avdeyev | CV"
    author="Ivan Avdeyev"
    subject="Frontend Developer CV"
    creator="Forme"
    lang="en"
    tagged
    style={{ fontFamily: 'Courier', fontSize: 10, color: BLACK }}
  >
    <PdfPage size="A4" margin={34} style={{ gap: 10, backgroundColor: '#ffffff' }}>
      <Header />
      <View>
        <View style={{ position: 'relative', top: -7 }}>
          <SectionTitle icon="user-3-line">Professional Summary</SectionTitle>
          <Text style={{ fontSize: 10, lineHeight: 1.625 }}>
          Frontend developer who occasionally forgets where the frontend ends. I build web and mobile interfaces across different stacks, and enjoy digging into hardware, firmware, backend tooling, and whatever makes an idea work. I care about clean architecture, good UX, developer experience, and understanding how things work under the hood.
          </Text>
        </View>
      </View>
      <WorkExperience items={work.slice(0, 3)} title />
      <PageNumber>1</PageNumber>
    </PdfPage>

    <PdfPage size="A4" margin={34} style={{ gap: PAGE_GAP, backgroundColor: '#ffffff' }}>
      <WorkExperience items={work.slice(3)} />
      <View>
        <SectionTitle icon="graduation-cap-line">Education</SectionTitle>
        <View wrap={false} style={{ borderLeft: `1.5 solid ${BLACK}`, paddingLeft: 18, paddingRight: 12, paddingVertical: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
            <View style={{ flexGrow: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: 700 }}>1305000 - Information Systems</Text>
              <Text style={{ fontSize: 10, color: GRAY, fontWeight: 500 }}>Eastern Technical and Humanities College · Oskemen, KZ</Text>
            </View>
            <View wrap={false} style={{ height: 22, border: `0.75 solid ${BLACK}`, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: 600 }}>2016–2020</Text>
            </View>
          </View>
          <Text style={{ fontSize: 10 }}>Vocational · 1305023 - Software Technician, 1305011 - Designer</Text>
        </View>
      </View>

      <View>
        <SectionTitle icon="tools-line">Technical Skills</SectionTitle>
        <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {visibleSkills.map((group) => <SkillsBlock key={group.name} title={group.name} skills={group.keywords} />)}
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
      <PageNumber>2</PageNumber>
    </PdfPage>
  </Document>
)
