import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'
import { useWixContent } from '../hooks/useWixContent'
import { fetchAboutUs } from '../services/wixContentService'
import { SITE_NAME } from '../utils/structuredData'
import './AboutPage.css'

// Stable reference so useWixContent's useEffect doesn't re-run on every render
const fetchAboutUsStable = fetchAboutUs

function AboutPage() {
  const { data: items, loading, error } = useWixContent(fetchAboutUsStable)

  return (
    <div className="about-page">
      <Helmet>
        <title>About Us | {SITE_NAME}</title>
        <meta name="description" content="Learn more about Antiques Marketplace — our story, our passion for antiques, and the team behind the collection." />
        <link rel="canonical" href="/about" />
      </Helmet>

      <h2 className="about-heading">About Us</h2>

      {loading && (
        <div className="about-loading" aria-label="Loading content">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
        </div>
      )}

      {!loading && error && (
        <div className="about-error" role="alert">
          <h2>Unable to load content</h2>
          <p>We couldn&apos;t load this page right now. Please try again later.</p>
          {import.meta.env.DEV && (
            <details className="about-debug" style={{ marginTop: '1rem' }}>
              <summary>Debug: error details</summary>
              <pre>{error}</pre>
            </details>
          )}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="about-empty">No content available yet.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="about-items">
          {items.map((item, index) => (
            <AboutItem key={item?._id ?? index} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Convert a wix:image://v1/abc~mv2.jpg/... URI to a usable https URL */
function resolveWixImageUrl(raw) {
  if (!raw) return null
  if (typeof raw === 'object') return raw.url || raw.src || null
  if (typeof raw !== 'string') return null
  if (raw.startsWith('http')) return raw
  const match = /wix:image:\/\/v1\/([^/]+)/.exec(raw)
  return match ? `https://static.wixstatic.com/media/${match[1]}` : null
}

function AboutItem({ item }) {
  const ownerName = typeof item.ownerName === 'string' ? item.ownerName : null

  // ownerBio may be a plain string, HTML string, or a Wix rich-text object
  let ownerBio = null
  if (typeof item.ownerBio === 'string') {
    ownerBio = item.ownerBio
  } else if (item.ownerBio && typeof item.ownerBio === 'object') {
    ownerBio = item.ownerBio.html || item.ownerBio.plainText || null
  }

  const imageUrl = resolveWixImageUrl(item.ownerPhoto)

  const contactEmail = typeof item.contactEmail === 'string' ? item.contactEmail : null

  let foundingYear = null
  if (item.foundingDate) {
    const d = item.foundingDate instanceof Date ? item.foundingDate : new Date(item.foundingDate)
    if (!Number.isNaN(d.getFullYear())) foundingYear = d.getFullYear()
  }

  return (
    <article className="about-item">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={ownerName || 'Owner photo'}
          className="about-owner-photo"
        />
      )}

      {ownerName && <h3 className="about-owner-name">{ownerName}</h3>}

      {(foundingYear || contactEmail) && (
        <dl className="about-meta">
          {foundingYear && (<><dt>Est.</dt><dd>{foundingYear}</dd></>)}
          {contactEmail && (<><dt>Contact</dt><dd><a href={`mailto:${contactEmail}`}>{contactEmail}</a></dd></>)}
        </dl>
      )}

      {ownerBio && (
        <details className="about-bio">
          <summary>Read bio</summary>
          <div
            className="about-item-body"
            dangerouslySetInnerHTML={{ __html: ownerBio }}
          />
        </details>
      )}

      {!ownerName && !ownerBio && !imageUrl && (
        <p className="about-empty">
          Content fields: <strong>{Object.keys(item).join(', ')}</strong>
        </p>
      )}
    </article>
  )
}

AboutItem.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string,
    ownerName: PropTypes.string,
    ownerBio: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        html: PropTypes.string,
        plainText: PropTypes.string,
      }),
    ]),
    ownerPhoto: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    contactEmail: PropTypes.string,
    foundingDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
}

export default AboutPage
