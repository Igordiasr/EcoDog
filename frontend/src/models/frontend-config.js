export function officialLinks(env = {}) {
    const number = String(env.VITE_WHATSAPP_NUMBER || '').trim();
    const safeURL = (value, hosts) => {
        try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && hosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url.href : null; }
        catch { return null; }
    };
    const whatsapp = /^[1-9]\d{7,14}$/.test(number) ? `https://wa.me/${number}${env.VITE_WHATSAPP_MESSAGE ? `?text=${encodeURIComponent(env.VITE_WHATSAPP_MESSAGE)}` : ''}` : null;
    return { whatsapp, instagram: safeURL(env.VITE_INSTAGRAM_URL, ['instagram.com']), maps: safeURL(env.VITE_GOOGLE_MAPS_URL, ['google.com', 'maps.app.goo.gl', 'goo.gl']) };
}
// Destinos oficiais confirmados pelo responsável pelo projeto.
export const officialInstagramURL = 'https://www.instagram.com/ecodogpark?utm_source=ig_web_button_share_sheet&vrfl=ZDNlZDc0MzIxNw==';
export const officialMapsEmbedURL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.9402078385847!2d-46.20825012363284!3d-23.53465286061344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cdd9c06d9f5909%3A0x293ef7ed1e03452b!2sEcodog%20Park!5e0!3m2!1spt-BR!2sbr!4v1793710322237!5m2!1spt-BR!2sbr';
const env = import.meta.env || {};
export const frontendLinks = officialLinks({ ...env, VITE_INSTAGRAM_URL: env.VITE_INSTAGRAM_URL || officialInstagramURL });
