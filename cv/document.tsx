/** @jsxImportSource react */
import type { ReactNode } from 'react'
import { PdfIcon } from './icon'
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

const work: WorkItem[] = [
  {
    position: 'Frontend Developer', company: 'Raison Securities Ltd', startDate: 'Feb 2024', endDate: 'Present',
    location: { city: 'Almaty', countryCode: 'KZ' },
    highlights: [
      'Maintained mobile app features, improving reliability and user experience.',
      'Rebuilt the company website to improve performance and SEO metrics.',
      'Built a scalable and reusable UI component library.',
    ],
  },
  {
    position: 'Frontend Developer', company: 'Tile.Expert Ltd', startDate: 'Jul 2022', endDate: 'Aug 2023',
    location: { label: 'Remote' },
    highlights: [
      'Rebuilt legacy functionality from scratch using Next.js, delivering more maintainable and performant solutions.',
      'Built reusable, well-documented UI components using Storybook.',
      'Contributed to project architecture and core infrastructure decisions.',
    ],
  },
  {
    position: 'Frontend Developer', company: 'LLC Rating', startDate: 'Sep 2020', endDate: 'Jul 2022',
    location: { city: 'Oskemen', countryCode: 'KZ' },
    highlights: [
      'Developed and maintained React-based web applications used in production.',
      'Refactored a legacy JavaScript codebase to TypeScript, improving type safety and performance.',
      'Used SQL for data collection, analysis, and preparation for frontend visualization.',
      'Implemented complex data visualizations, including charts, maps, and tables.',
    ],
  },
  {
    position: 'Markup Developer', company: 'LLC Megagroup IT', startDate: 'Apr 2019', endDate: 'May 2020',
    location: { city: 'Oskemen', countryCode: 'KZ' },
    highlights: [
      'Created responsive, cross-browser, and semantic layouts for client websites.',
      'Integrated frontend layouts with CMS platforms and template engines.',
      'Integrated third-party scripts, widgets, and analytics to enhance functionality and track user behavior.',
    ],
  },
]

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
  const projects = [
    {
      name: 'luci-theme-shadcnui',
      url: 'https://github.com/eone666/luci-theme-shadcnui',
      description: 'A modern shadcn/ui-inspired theme for OpenWrt\'s LuCI interface. Light & dark modes, drop-in shadcn color themes.',
    },
    {
      name: '4x3_keypad',
      url: 'https://github.com/eone666/4x3_keypad',
      description: 'A custom XIAO RP2040 macro pad, from PCB design to QMK and Vial firmware.',
    },
    {
      name: 'mc-telegram-notifier',
      url: 'https://github.com/eone666/mc-telegram-notifier',
      description: 'A Minecraft Telegram plugin published on Modrinth with 1K+ downloads.',
    },
  ]
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
          Frontend developer who occasionally forgets where the frontend ends. I build interfaces with React and TypeScript, and enjoy digging into routers, firmware, backend tooling, and whatever makes an idea work. I care about clean architecture, good UX, developer experience, and understanding the abstraction underneath.
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
          <SkillsBlock title="Languages" skills={['JavaScript', 'TypeScript', 'HTML', 'CSS', 'SQL', 'GraphQL', 'SCSS', 'PostCSS', 'Kotlin', 'Gleam', 'C', 'Java']} />
          <SkillsBlock title="Frameworks & Libraries" skills={['React', 'Next.js', 'Astro', 'HonoX', 'Hono', 'Tailwind', 'Vue', 'Nuxt', 'React Query', 'Redux']} />
          <SkillsBlock title="Tools & Platforms" skills={['Storybook', 'Git', 'Vitest', 'Playwright', 'Node.js', 'PostgreSQL', 'Docker', 'Vite']} />
          <SkillsBlock title="Concepts" skills={['REST APIs', 'UX', 'CI/CD', 'Architecture', 'Software Design', 'SEO']} />
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
