import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportarPDF = (titulo, colunas, linhas) => {
  const doc = new jsPDF()

  doc.setFontSize(14)
  doc.setTextColor(27, 94, 32)
  doc.text(titulo, 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 22)

  autoTable(doc, {
    head: [colunas],
    body: linhas,
    startY: 27,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [27, 94, 32] },
    alternateRowStyles: { fillColor: [240, 248, 240] },
  })

  doc.save(`${titulo}.pdf`)
}

export const exportarXLSX = (titulo, colunas, linhas) => {
  const ws = XLSX.utils.aoa_to_sheet([colunas, ...linhas])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, titulo.substring(0, 31))
  XLSX.writeFile(wb, `${titulo}.xlsx`)
}
