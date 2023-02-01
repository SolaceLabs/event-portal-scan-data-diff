import '../styles/global.css'
import '../styles/table.css'
import '../styles/diff.css'
import { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
