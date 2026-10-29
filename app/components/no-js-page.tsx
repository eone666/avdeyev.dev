export function NoJsPage() {
  return <main class="screen no-js-screen">
    <div class="no-js-content">
      <p class="no-js-path">root@avdeyev.dev:~ #</p>
      <p class="no-js-status">[ JavaScript disabled ]</p>
      <h1>The terminal is offline.</h1>
      <p>This interactive site needs JavaScript. You can still find me here:</p>
      <nav aria-label="Contact and CV">
        <a href="/cv.pdf">Read my CV <span aria-hidden="true">↗</span></a>
        <a href="https://github.com/eone666">GitHub <span aria-hidden="true">↗</span></a>
        <a href="mailto:contact@avdeyev.dev">contact@avdeyev.dev <span aria-hidden="true">✉</span></a>
      </nav>
      <p class="no-js-return">Enable JavaScript and <a href="/">reload the site</a> to explore.</p>
    </div>
  </main>
}
