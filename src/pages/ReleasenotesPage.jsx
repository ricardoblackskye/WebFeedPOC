import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import rawReleaseNotes from '../../releasenotes.md?raw'
import { SITE_NAME } from '../utils/structuredData'
import './ReleasenotesPage.css'

export default function ReleasenotesPage() {
  const [content, setContent] = useState('')

  useEffect(() => {
    setContent(rawReleaseNotes)
  }, [])

  return (
    <div className="releasenotes-page">
      <Helmet>
        <title>Release Notes | {SITE_NAME}</title>
        <meta
          name="description"
          content="Release notes and changelog for Antiques Marketplace."
        />
        <link rel="canonical" href="/releasenotes" />
      </Helmet>

      <div className="releasenotes-content">
        <h1>Release Notes</h1>
        <pre>{content}</pre>
      </div>
    </div>
  )
}
