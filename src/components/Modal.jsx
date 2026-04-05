export default function Modal({ titulo, children, onFechar }) {
  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button onClick={onFechar}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
