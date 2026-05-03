import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateOrderReport = (order, equipos = []) => {
  try {
    const doc = new jsPDF();
    const eq = equipos.find(e => e.id === order.equipo_id);
    
    // Header Industrial
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 107, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DRAFTIN", 15, 25);
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.text("INSPECCIÓN TÉCNICA Y MANTENIMIENTO", 15, 32);
    
    // Datos OT
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`ACTA DE INSPECCIÓN: #${order.id.slice(0, 8)}`, 15, 55);
    
    const info = [
      ["Equipo", eq?.nombre || 'General'],
      ["Unidad/Satélite", order.sub_equipo || 'N/A'],
      ["Tipo", order.tipo],
      ["Prioridad", order.prioridad],
      ["Técnico", order.tecnico_asignado || 'Externo/OCA'],
      ["Fecha Intervención", new Date(order.fecha_programada || order.created_at).toLocaleDateString()]
    ];
    
    autoTable(doc, {
      startY: 60,
      body: info,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', width: 45 } }
    });
    
    // Descripción
    let finalY = 110;
    // @ts-ignore
    if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 10;
    }

    doc.setFont("helvetica", "bold");
    doc.text("CONCLUSIONES DE LA INSPECCIÓN:", 15, finalY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitText = doc.splitTextToSize(order.descripcion || 'Inspección técnica reglamentaria realizada sin observaciones críticas adicionales.', 180);
    doc.text(splitText, 15, finalY + 7);
    
    // Evidencia Fotográfica
    const photoY = finalY + 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("REGISTRO FOTOGRÁFICO DE EVIDENCIAS", 15, photoY);
    
    const imgWidth = 85;
    const imgHeight = 65;
    
    const drawPhoto = (photoData, x, label) => {
      if (photoData && photoData.startsWith('data:image')) {
        try {
          doc.addImage(photoData, 'JPEG', x, photoY + 5, imgWidth, imgHeight);
          doc.setFontSize(8);
          doc.text(label, x, photoY + imgHeight + 10);
        } catch (e) {
          doc.rect(x, photoY + 5, imgWidth, imgHeight);
          doc.text("ERROR CARGANDO IMAGEN", x + 5, photoY + 35);
        }
      } else {
        doc.setDrawColor(230);
        doc.rect(x, photoY + 5, imgWidth, imgHeight);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`EVIDENCIA ${label}`, x + 20, photoY + 35);
      }
    };

    drawPhoto(order.foto_antes, 15, "ESTADO INICIAL");
    drawPhoto(order.foto_despues, 110, "ESTADO TRAS INTERVENCIÓN");
    
    // Pie de página
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text("Documento oficial generado por DRAFTIN HMI para el control de activos industriales.", 105, 285, { align: "center" });
    
    doc.save(`INSPECCION_${order.id.slice(0, 8)}_${eq?.nombre || 'Planta'}.pdf`);
  } catch (err) {
    console.error("Error crítico PDF:", err);
    alert("ERROR AL GENERAR PDF: " + err.message);
  }
};
