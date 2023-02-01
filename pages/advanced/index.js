import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
export default function Advanced() {

  // Call the init code to set up elasticsearch
  // This only needs to be done once on the backend, but there is
  // no easy way to do that in nextjs, but it doesn't hurt to 
  // call it every time.

  const resyncWithEp = () => {
    fetch("/api/resync");
  }

  const remapScans = () => {
    fetch("/api/resync?remap=true");
  }

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
      <h2>Advanced</h2>
        <div>
            <button className="button button3" onClick={() => resyncWithEp()}>Resync with Event Portal</button>
            <button className="button button3" onClick={() => remapScans()}>Remap Scans</button>
        </div>
      </section>
    </Layout>
  )
}

