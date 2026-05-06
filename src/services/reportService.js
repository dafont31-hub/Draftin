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
    const empresa = (branding.empresa_nombre || 'LITERA MEAT').toUpperCase();
    const primaryColor = branding.color_primario || '#C1001B';
    const secondaryColor = branding.color_secundario || '#00843D';
    
    // --- CABECERA INDUSTRIAL MODERNA ---
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo / Nombre Empresa
    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(empresa, 15, 25);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("SISTEMA DE GESTIÓN TÉRMICA INDUSTRIAL | DRAFTIN HMI", 15, 32);
    
    // Bloque de datos derecha
    doc.setFillColor(40, 40, 40);
    doc.rect(130, 0, 80, 40, 'F');
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("REGISTRO TÉCNICO", 140, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`FECHA: ${record.fecha}`, 140, 23);
    doc.text(`OPERARIO: ${record.operario || 'SISTEMA'}`, 140, 28);
    doc.text(`ESTADO: VALIDADO`, 140, 33);

    let currentY = 50;

    // Función auxiliar para tablas con estilo industrial
    const addSectionTable = (title, headers, data, accentColor = [193, 0, 27]) => {
      // Título de sección con barra lateral
      doc.setFillColor(...accentColor);
      doc.rect(15, currentY - 4, 2, 6, 'F');
      
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, currentY + 1);
      
      autoTable(doc, {
        startY: currentY + 4,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { 
          fillColor: [30, 30, 30], 
          textColor: 255, 
          fontSize: 8, 
          halign: 'center',
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 7, 
          halign: 'center',
          textColor: 50
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 15, right: 15 },
        styles: { cellPadding: 2 }
      });
      
      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 15;
    };

    // 1. GENERADORES DE VAPOR
    const calderas = record.datos_calderas || (record.datos && record.datos.calderas);
    if (calderas) {
      const calData = Object.entries(calderas).map(([id, d]) => [
        id.toUpperCase(), d.nv || '--', d.np || '--', `${d.pt || '--'} bar`, `${d.tv || '--'} °C`, d.cond || '--', d.hf || '--', d.ga || '--'
      ]);
      addSectionTable("1. GENERADORES DE VAPOR (CALDERAS)", 
        ["CAL", "NIVEL V.", "NIVEL %", "PRES.", "TEMP.", "COND.", "HORAS", "GAS"], 
        calData, [255, 107, 0]);
    }

    // 2. CONTROL QUÍMICO
    const quimica = record.datos_quimica || (record.datos && record.datos.quimica);
    if (quimica) {
      const chemData = Object.entries(quimica).map(([id, d]) => [
        id.toUpperCase().replace('DUP', 'DÚPLEX ').replace('TRI', 'TRÍPLEX '), d.d || '--', d.ph || '--', d.c || '--'
      ]);
      addSectionTable("2. ANÁLISIS QUÍMICO DEL AGUA", 
        ["PUNTO DE MUESTREO", "DUREZA (°fH)", "PH", "CONDUCTIVIDAD (µS/cm)"], 
        chemData, [0, 163, 255]);
    }

    // 3. EQUIPOS DE TRATAMIENTO
    const descalcificadores = record.datos_descalcificadores || (record.datos && record.datos.descalcificadores);
    if (descalcificadores) {
      const descData = Object.entries(descalcificadores).map(([id, d]) => [
        id.toUpperCase(), d.aa || '--', d.ad || '--'
      ]);
      addSectionTable("3. EQUIPOS DE TRATAMIENTO (DESCALCIFICADORES)", 
        ["EQUIPO", "CONTADOR ANTES", "CONTADOR DESPUÉS"], 
        descData, [0, 132, 61]);
    }

    // 4. SISTEMAS DE LIMPIEZA
    const rawDatos = record.datos;
    const statusData = typeof rawDatos === 'string' ? JSON.parse(rawDatos) : (rawDatos || {});
    const satelites = record.datos_satelites || statusData.satelites || {};
    
    if (Object.keys(satelites).length > 0) {
      const satData = Object.entries(satelites).map(([id, d]) => {
        const checklist = [
          d.v_retencion ? 'OK' : 'FAIL',
          d.filtro ? 'OK' : 'FAIL',
          d.inyector ? 'OK' : 'FAIL'
        ].join(' | ');

        return [
          id.toUpperCase().split('-').pop(),
          d.ok ? 'CORRECTO' : 'AVERÍA',
          d.p_agua || '--',
          d.p_aire || '--',
          d.quimico || '--',
          d.manguera_ok ? 'OK' : 'DAÑADA',
          checklist,
          d.obs || '--'
        ];
      });

      addSectionTable("4. SISTEMAS DE LIMPIEZA (SATÉLITES)", 
        ["ID", "ESTADO", "P. AGUA", "P. AIRE", "% CONC", "MANG.", "CHECKLIST", "OBSERVACIONES"], 
        satData, [0, 224, 255]);
    }

    // Observaciones finales
    if (record.observaciones) {
      if (currentY > 240) { doc.addPage(); currentY = 20; }
      doc.setFillColor(245, 245, 245);
      doc.rect(15, currentY, 180, 30, 'F');
      
      doc.setTextColor(0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVACIONES E INCIDENCIAS DEL TURNO:", 20, currentY + 8);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      const splitObs = doc.splitTextToSize(record.observaciones, 170);
      doc.text(splitObs, 20, currentY + 15);
    }

    // --- PIE DE PÁGINA ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(15, 280, 195, 280);
      doc.setTextColor(150);
      doc.setFontSize(7);
      doc.text(`DRAFTIN HMI INDUSTRIAL - DOCUMENTO TÉCNICO GENERADO AUTOMÁTICAMENTE - PÁGINA ${i} DE ${pageCount}`, 105, 285, { align: "center" });
    }

    doc.save(`INSPECCION_${record.fecha}_${empresa}.pdf`);
  } catch (err) {
    console.error("Error reporte checklist:", err);
    alert("ERROR AL GENERAR REPORTE: " + err.message);
  }
};
