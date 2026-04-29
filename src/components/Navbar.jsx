import { NavLink } from 'react-router-dom'

const TRI_PATH =
  'M 13,5 L 87,5 Q 95,5 91,12 L 54,83 Q 50,90 46,83 L 9,12 Q 5,5 13,5 Z'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/fazendas', label: 'Fazendas' },
  { to: '/animais', label: 'Animais' },
  { to: '/rebanhos', label: 'Rebanhos' },
  { to: '/pesagens', label: 'Pesagens' },
  { to: '/eventos', label: 'Partos' },
  { to: '/vacinas', label: 'Vacinas' },
  { to: '/vacinacoes', label: 'Vacinações' },
  { to: '/pastos', label: 'Pastos' },
  { to: '/relatorios', label: 'Relatórios' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo-wrap">
        <svg viewBox="0 0 100 95" className="navbar-tri-svg" aria-hidden="true">
          <defs>
            <clipPath id="tri-clip">
              <path d={TRI_PATH} />
            </clipPath>
          </defs>
          <path d={TRI_PATH} fill="#F5F5E6" />
          <image
            href="/logo.png"
            x="5" y="3"
            width="90" height="78"
            clipPath="url(#tri-clip)"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      </div>

      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) => (isActive ? 'ativo' : '')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
