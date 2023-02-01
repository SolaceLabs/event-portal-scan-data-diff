import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import EnvList from '../components/EnvList'
export default function Home() {

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <EnvList/>
      </section>
      <h1></h1>
      <Link href={{ pathname: '/advanced'}}>Advanced</Link>
    </Layout>
  )
}

