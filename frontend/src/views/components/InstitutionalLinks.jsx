import { frontendLinks, officialMapsEmbedURL } from '../../models/frontend-config';
export function InstitutionalLinks({ kind }) {
    if (kind === 'instagram') return null;
    return <nav className="institutional-links" aria-label="Como chegar"><iframe className="institutional-map" title="Localização do EcoDog Park no Google Maps" src={officialMapsEmbedURL} width="600" height="450" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/>{frontendLinks.maps && <a className="footer-maps-link" href={frontendLinks.maps} target="_blank" rel="noopener noreferrer" aria-label="Ver localização no Google Maps" title="Ver no Google Maps"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg></a>}</nav>;
}
