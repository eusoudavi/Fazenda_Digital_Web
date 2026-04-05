export default function Paginacao({ total, itensPorPagina, paginaAtual, onMudarPagina }) {
  const totalPaginas = Math.ceil(total / itensPorPagina)
  if (totalPaginas <= 1) return null

  const inicio = (paginaAtual - 1) * itensPorPagina + 1
  const fim = Math.min(paginaAtual * itensPorPagina, total)

  // Gera a lista de páginas visíveis (máx 5 ao redor da atual)
  const paginas = []
  const delta = 2
  for (let i = Math.max(1, paginaAtual - delta); i <= Math.min(totalPaginas, paginaAtual + delta); i++) {
    paginas.push(i)
  }

  return (
    <div className="paginacao">
      <span className="paginacao-info">
        {inicio}–{fim} de {total}
      </span>
      <div className="paginacao-botoes">
        <button
          className="pag-btn"
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
        >
          ‹
        </button>

        {paginas[0] > 1 && (
          <>
            <button className="pag-btn" onClick={() => onMudarPagina(1)}>1</button>
            {paginas[0] > 2 && <span className="pag-ellipsis">…</span>}
          </>
        )}

        {paginas.map((p) => (
          <button
            key={p}
            className={`pag-btn ${p === paginaAtual ? 'pag-ativo' : ''}`}
            onClick={() => onMudarPagina(p)}
          >
            {p}
          </button>
        ))}

        {paginas[paginas.length - 1] < totalPaginas && (
          <>
            {paginas[paginas.length - 1] < totalPaginas - 1 && <span className="pag-ellipsis">…</span>}
            <button className="pag-btn" onClick={() => onMudarPagina(totalPaginas)}>{totalPaginas}</button>
          </>
        )}

        <button
          className="pag-btn"
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
        >
          ›
        </button>
      </div>
    </div>
  )
}
