import { createRoute } from 'honox/factory'
import { TerminalHome } from '@/components/terminal-home'

export default createRoute((c) =>
  c.render(
    <TerminalHome />,
    {
      title: 'Ivan Avdeyev | Frontend Developer',
      description: 'Frontend developer Ivan Avdeyev — projects, professional profiles, contact details and CV.',
      canonical: 'https://avdeyev.dev'
    }
  )
)
