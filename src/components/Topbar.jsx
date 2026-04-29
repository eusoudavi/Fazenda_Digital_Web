import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTema } from '../contexts/ThemeContext'
import Modal from './Modal'

const API_URL = 'http://localhost:8080'
const VERSAO = '1.0.0'

function iniciais(nome) {
  if (!nome) return '?'
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function IconUsuarios() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconFazendas() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconConfig() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconSair() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconSol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IconLua() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function labelPerfil(perfil) {
  const map = {
    ADMINISTRADOR: 'Administrador',
    VETERINARIO: 'Veterinário',
    FUNCIONARIO: 'Funcionário',
  }
  return map[perfil] ?? perfil ?? '—'
}

function ModalConfiguracoes({ onFechar }) {
  const { tema, setTema } = useTema()
  const { usuario } = useAuth()

  return (
    <Modal titulo="Configurações do Sistema" onFechar={onFechar}>
      <div className="config-corpo">

        <div className="config-grupo">
          <div className="config-grupo-titulo">Aparência</div>
          <div className="config-tema-opts">
            <button
              className={'config-tema-btn' + (tema === 'claro' ? ' ativo' : '')}
              onClick={() => setTema('claro')}
            >
              <IconSol />
              Claro
            </button>
            <button
              className={'config-tema-btn' + (tema === 'escuro' ? ' ativo' : '')}
              onClick={() => setTema('escuro')}
            >
              <IconLua />
              Escuro
            </button>
          </div>
        </div>

        <div className="config-grupo">
          <div className="config-grupo-titulo">Usuário logado</div>
          <dl className="config-dl">
            <div className="config-row">
              <dt>Nome</dt>
              <dd>{usuario?.nome ?? '—'}</dd>
            </div>
            <div className="config-row">
              <dt>E-mail</dt>
              <dd>{usuario?.email ?? '—'}</dd>
            </div>
            <div className="config-row">
              <dt>Perfil</dt>
              <dd>{labelPerfil(usuario?.perfil)}</dd>
            </div>
          </dl>
        </div>

        <div className="config-grupo">
          <div className="config-grupo-titulo">Sistema</div>
          <dl className="config-dl">
            <div className="config-row">
              <dt>Aplicativo</dt>
              <dd>AgroNomus</dd>
            </div>
            <div className="config-row">
              <dt>Versão</dt>
              <dd>{VERSAO}</dd>
            </div>
            <div className="config-row">
              <dt>Servidor API</dt>
              <dd className="config-url">{API_URL}</dd>
            </div>
            <div className="config-row">
              <dt>Ambiente</dt>
              <dd>{import.meta.env.MODE === 'production' ? 'Produção' : 'Desenvolvimento'}</dd>
            </div>
          </dl>
        </div>

      </div>
    </Modal>
  )
}

export default function Topbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [configAberta, setConfigAberta] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const fechar = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto])

  const handleLogout = () => {
    setAberto(false)
    logout()
    navigate('/login')
  }

  const abrirConfig = () => {
    setAberto(false)
    setConfigAberta(true)
  }

  return (
    <>
      <header className="topbar">
        <span className="topbar-brand">
          <span style={{ color: '#F5F5E6' }}>Agro</span>
          <span style={{ color: '#81c784' }}>Nomus</span>
        </span>

        <div className="topbar-avatar-wrap" ref={dropRef}>
          <button
            className="topbar-avatar"
            onClick={() => setAberto((v) => !v)}
            aria-label="Menu do usuário"
          >
            {iniciais(usuario?.nome)}
          </button>

          {aberto && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <div className="topbar-dropdown-nome">{usuario?.nome ?? '—'}</div>
                {usuario?.email && (
                  <div className="topbar-dropdown-email">{usuario.email}</div>
                )}
              </div>
              <div className="topbar-dropdown-body">
                <Link to="/usuarios" className="topbar-dropdown-item" onClick={() => setAberto(false)}>
                  <IconUsuarios /> Usuários
                </Link>
                <Link to="/fazendas" className="topbar-dropdown-item" onClick={() => setAberto(false)}>
                  <IconFazendas /> Fazendas
                </Link>
                <div className="topbar-dropdown-divider" />
                <button className="topbar-dropdown-item" onClick={abrirConfig}>
                  <IconConfig /> Configurações
                </button>
                <div className="topbar-dropdown-divider" />
                <button className="topbar-dropdown-item topbar-dropdown-sair" onClick={handleLogout}>
                  <IconSair /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {configAberta && <ModalConfiguracoes onFechar={() => setConfigAberta(false)} />}
    </>
  )
}
