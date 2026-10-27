export function ArrowIcon({ direction }) {
    // Exact arrow geometry already used by the prototype's arrow-left SVG.
    return <svg className={`project-arrow project-arrow-${direction}`} viewBox="-2 -2 18 18" width="18" height="18" fill="none" aria-hidden="true" focusable="false" data-arrow-direction={direction}>
    <path d="M7 14l-7-7 7-7m7 7l-14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
const characters = { '←': 'left', '‹': 'left', '→': 'right', '›': 'right', '↑': 'up', '↓': 'down', '⌄': 'down', '▾': 'down' };
export function arrowText(text) {
    return text.split(/([←→‹›↑↓⌄▾])/).map((part, index) => characters[part]
        ? <span className="arrow-text-slot" key={index}><span className="arrow-text-footprint" aria-hidden="true">{part}</span><ArrowIcon direction={characters[part]}/></span>
        : part);
}
