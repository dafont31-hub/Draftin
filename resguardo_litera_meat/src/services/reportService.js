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

export const generateBulkReport = (ordenes = [], equipos = []) => {
  try {
    const doc = new jsPDF();
    if (ordenes.length === 0) {
      alert('No hay órdenes para reportar.');
      return;
    }
    
    doc.setFontSize(20);
    doc.text("DRAFTIN - REPORTE DE ACTIVIDAD", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Resumen General de Mantenimiento - Generado el ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableData = ordenes.map(o => {
      const eq = equipos.find(e => e.id === o.equipo_id);
      return [
        o.id.slice(0, 8), 
        eq?.nombre || 'General', 
        o.titulo, 
        o.tipo, 
        o.estado,
        new Date(o.created_at).toLocaleDateString()
      ];
    });
    
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Equipo', 'Título', 'Tipo', 'Estado', 'Fecha']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [255, 107, 0], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    doc.save(`Reporte_Actividad_Draftin_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error("Error en reporte global:", err);
    alert("ERROR REPORTE GLOBAL: " + err.message);
  }
};

export const generateChecklistReport = (record, branding = {}) => {
  try {
    const doc = new jsPDF();
    const empresa = (branding.empresa_nombre || 'litera meat').toLowerCase();
    const primaryColor = '#C1001B'; // Rojo real
    const secondaryColor = '#00843D'; // Verde real
    
    // Header Industrial v2
    doc.setFillColor(255, 255, 255); // Fondo blanco para que resalten los colores
    doc.rect(0, 0, 210, 45, 'F');
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(1.5);
    doc.line(15, 40, 195, 40); // Línea verde de acento
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(empresa, 15, 28);
    
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Pini Group | Sistema de Gestión Térmica", 15, 35);
    
    doc.setTextColor(primaryColor);
    doc.text(`REGISTRO TÉCNICO DIARIO - ${record.fecha}`, 140, 25);
    doc.setTextColor(0);
    doc.text(`OPERARIO: ${record.operario || 'SISTEMA'}`, 140, 33);
    
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SISTEMA DE GESTIÓN TÉRMICA INDUSTRIAL", 15, 33);
    doc.text(`REGISTRO TÉCNICO DIARIO - ${record.fecha}`, 140, 25);
    doc.text(`OPERARIO: ${record.operario || 'SISTEMA'}`, 140, 33);

    let currentY = 55;

    // Función auxiliar para tablas
    const addSectionTable = (title, headers, data, color = [40, 40, 40]) => {
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(title, 15, currentY);
      
      autoTable(doc, {
        startY: currentY + 3,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { fillColor: color, textColor: 255, fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 7, halign: 'center' },
        margin: { left: 15, right: 15 }
      });
      
      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 12;
    };

    // 1. GENERADORES DE VAPOR
    if (record.datos_calderas) {
      const calData = Object.entries(record.datos_calderas).map(([id, d]) => [
        id.toUpperCase(), d.nv, d.np, d.pt, d.tv, d.cond, d.hf, d.ga
      ]);
      addSectionTable("1. GENERADORES DE VAPOR (CALDERAS)", 
        ["CAL", "NIVEL V.", "NIVEL %", "PRES.", "TEMP.", "COND.", "HORAS", "GAS"], 
        calData, [255, 107, 0]);
    }

    // 2. CONTROL QUÍMICO
    if (record.datos_quimica) {
      const chemData = Object.entries(record.datos_quimica).map(([id, d]) => [
        id.toUpperCase(), d.d, d.ph, d.c
      ]);
      addSectionTable("2. ANÁLISIS QUÍMICO DEL AGUA", 
        ["PUNTO", "DUREZA", "PH", "CONDUCTIVIDAD"], 
        chemData, [0, 163, 255]);
    }

    // 3. DESCALCIFICADORES E INTERCAMBIADORES
    if (record.datos_descalcificadores) {
      const descData = Object.entries(record.datos_descalcificadores).map(([id, d]) => [
        id.toUpperCase(), d.aa, d.ad
      ]);
      addSectionTable("3. EQUIPOS DE TRATAMIENTO (DESCALCIFICADORES)", 
        ["EQUIPO", "AGUA ANTES", "AGUA DESPUÉS"], 
        descData, [0, 255, 136]);
    }

    // 4. SISTEMAS DE LIMPIEZA (SATÉLITES AC 35-B-S)
    const rawDatos = record.datos;
    const statusData = typeof rawDatos === 'string' ? JSON.parse(rawDatos) : (rawDatos || {});
    const satelites = statusData.satelites || {};
    
    if (Object.keys(satelites).length > 0) {
      const satData = Object.entries(satelites).map(([id, d]) => {
        const checklist = [
          d.v_retencion ? 'V' : 'X',
          d.filtro ? 'V' : 'X',
          d.inyector ? 'V' : 'X',
          d.acoplamientos ? 'V' : 'X',
          d.selectores ? 'V' : 'X'
        ].join('/');

        return [
          id.toUpperCase().split('-').pop(),
          d.ok ? 'OK' : 'ERROR',
          d.p_agua || '--',
          d.p_aire || '--',
          d.quimico || '--',
          d.manguera_ok ? 'CORRECTA' : 'DAÑADA',
          checklist,
          d.obs || '--'
        ];
      });

      addSectionTable("4. SISTEMAS DE LIMPIEZA (SATÉLITES)", 
        ["SAT", "ESTADO", "P. AGUA", "P. AIRE", "CONC %", "MANGUERA", "CHKLST*", "OBSERVACIONES"], 
        satData, [0, 224, 255]);
        
      doc.setFontSize(6);
      doc.setTextColor(150);
      doc.text("*CHKLST: V.Ret / Filtro / Inyec / Acopl / Selec (V=Correcto / X=Fallo)", 15, currentY - 8);
    }

    // Observaciones
    if (record.observaciones) {
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVACIONES E INCIDENCIAS:", 15, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitObs = doc.splitTextToSize(record.observaciones, 180);
      doc.text(splitObs, 15, currentY + 6);
      currentY += (splitObs.length * 5) + 10;
    }

    // Pie de página con validez técnica
    doc.setDrawColor(200);
    doc.line(15, 275, 195, 275);
    doc.setTextColor(150);
    doc.setFontSize(7);
    doc.text("Este documento es un registro digital generado por la plataforma DRAFTIN. Posee validez técnica para auditorías internas.", 105, 282, { align: "center" });
    doc.text("CALDERAS | INTERCAMBIADORES | QUÍMICA | CONSUMOS", 105, 286, { align: "center" });

    doc.save(`INSPECCION_DIARIA_${record.fecha}_${record.operario || 'OPERARIO'}.pdf`);
  } catch (err) {
    console.error("Error reporte checklist:", err);
    alert("ERROR AL GENERAR REPORTE: " + err.message);
  }
};
