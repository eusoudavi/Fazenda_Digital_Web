import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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
  { to: '/relatorios', label: 'Relatórios' },
]

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
      <div className="navbar-footer">
        {usuario && <span className="navbar-usuario">{usuario.nome}</span>}
        <button className="navbar-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  )
}
