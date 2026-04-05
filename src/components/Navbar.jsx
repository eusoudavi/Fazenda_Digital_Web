import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/animais', label: 'Animais' },
  { to: '/rebanhos', label: 'Rebanhos' },
  { to: '/pesagens', label: 'Pesagens' },
  { to: '/eventos', label: 'Partos' },
  { to: '/vacinas', label: 'Vacinas' },
  { to: '/vacinacoes', label: 'Vacinações' },
  { to: '/relatorios', label: 'Relatórios' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Fazenda Digital</div>
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
