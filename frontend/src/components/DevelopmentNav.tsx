import { Link, useLocation } from 'react-router-dom';
import { screens } from '../screens/catalog';
import './DevelopmentNav.css';

export function DevelopmentNav() {
  const { pathname } = useLocation();

  return <nav className="development-nav" aria-label="Telas de desenvolvimento">
    <span className="development-nav-label">DEV</span>
    <div className="development-nav-links">
      {screens.map(screen => {
        const previewPath = `/prototipo/${screen.id}`;
        const active = pathname === screen.path || pathname === previewPath;
        return <Link key={screen.id} to={previewPath} aria-current={active ? 'page' : undefined}>
          {screen.name}
        </Link>;
      })}
    </div>
  </nav>;
}
