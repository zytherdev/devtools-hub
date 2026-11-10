import type { Metadata } from 'next'
import { ContentPage } from '@/app/components/ContentPage'

export const metadata: Metadata = {
  title: 'Privacy Policy · DevTools Hub',
  description: 'How DevTools Hub handles tool input, local preferences, hosting requests, and third-party assets.',
}

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      description="How the site handles information when you browse and use its developer tools."
      icon="fa-solid fa-shield-halved"
      color="#347a58"
    >
      <p className="text-xs text-secondary">Last updated: <time dateTime="2026-11-10">November 10, 2026</time></p>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Tool input</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">Tools that perform local transformations process the input in your browser and do not intentionally upload or store that input. Some catalog entries may require an external lookup; a tool must identify that behavior before sending a query to a provider. Do not paste secrets into a tool unless you have reviewed its behavior and trust your device and browser environment.</p>
      </section>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Local preferences</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">The current interface saves your theme preference in browser storage so it can be restored on a later visit. Clearing site data in your browser removes that preference. Tool input and output are not intended to be saved by the app.</p>
      </section>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Hosting and third-party resources</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">The website is delivered over the internet. Its hosting, network, or security providers may receive standard request metadata such as an IP address, requested URL, timestamp, and browser information under their own policies. The current layout also loads Font Awesome CSS from cdnjs; that provider receives a request for the asset. This repository does not configure an analytics SDK, but production hosting and deployment settings are managed separately.</p>
      </section>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Your choices and contact</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">You can clear browser storage, stop using the site, or avoid tools that make an external request. For questions about this policy or to report a data-flow concern, open an issue in the <a href="https://github.com/zytherdev/devtools-hub/issues" target="_blank" rel="noopener noreferrer" className="font-medium text-[#347a58] hover:underline">project repository</a>.</p>
      </section>

      <p className="text-xs leading-5 text-secondary">This page describes the application code and known asset requests; it does not replace the privacy notices of the hosting provider or third-party services.</p>
    </ContentPage>
  )
}
