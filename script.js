window.onload = function() {
    // Mostrar/ocultar opciones para mayoristas
    document.getElementById('customerType').addEventListener('change', function() {
        const wholesaleOptions = document.getElementById('wholesaleOptions');
        if (this.value === 'wholesale') {
            wholesaleOptions.style.display = 'block';
            wholesaleOptions.style.animation = 'fadeIn 0.5s ease';
        } else {
            wholesaleOptions.style.display = 'none';
        }
    });

    // Funcionalidad para desbloquear campos
    document.querySelectorAll('.unlock-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.readOnly) {
                input.readOnly = false;
                icon.classList.remove('fa-lock');
                icon.classList.add('fa-lock-open');
                input.focus();
            } else {
                input.readOnly = true;
                icon.classList.remove('fa-lock-open');
                icon.classList.add('fa-lock');
            }
        });
    });

    // Event listeners para botones
    document.getElementById('calculateBtn').addEventListener('click', calculateCosts);
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    document.getElementById('exportPdfBtn').addEventListener('click', generatePDF);
};

function calculateCosts() {
    // Obtener valores de los inputs
    const isWholesale = document.getElementById('customerType').value === 'wholesale';
    const quantity = isWholesale ? parseInt(document.getElementById('quantity').value) || 1 : 1;
    const filamentPrice = parseFloat(document.getElementById('filamentPrice').value) || 0;
    const filamentUsed = parseFloat(document.getElementById('filamentUsed').value) || 0;
    const electricityPrice = parseFloat(document.getElementById('electricityPrice').value) || 0;
    const powerConsumption = parseFloat(document.getElementById('powerConsumption').value) || 0;
    const printTime = parseFloat(document.getElementById('printTime').value) || 0;
    const machineWear = parseFloat(document.getElementById('machineWear').value) || 0.50;
    const errorMargin = parseFloat(document.getElementById('errorMargin').value) || 30;
    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 20;

    // Calcular costos por unidad
    const materialCostPerUnit = (filamentPrice * filamentUsed) / 1000;
    const electricityCostPerUnit = (powerConsumption * printTime * electricityPrice) / 1000;
    const wearCostPerUnit = printTime * machineWear;
    
    // Costo base por unidad
    const baseCostPerUnit = materialCostPerUnit + electricityCostPerUnit + wearCostPerUnit;
    
    // Aplicar margen de error
    const costWithErrorPerUnit = baseCostPerUnit * (1 + errorMargin/100);
    
    // Aplicar margen de ganancia (precio por unidad antes de descuento)
    const priceBeforeDiscount = costWithErrorPerUnit * (1 + profitMargin/100);
    
    // Calcular descuento por cantidad si es mayorista
    let discount = 0;
    let discountAmountPerUnit = 0;
    let finalUnitPrice = priceBeforeDiscount;
    
    if (isWholesale) {
        if (quantity >= 100) {
            discount = 15;
        } else if (quantity >= 50) {
            discount = 10;
        } else if (quantity >= 10) {
            discount = 5;
        }
        
        discountAmountPerUnit = priceBeforeDiscount * (discount/100);
        finalUnitPrice = priceBeforeDiscount - discountAmountPerUnit;
    }
    
    // Mostrar sección de descuentos si corresponde
    const discountSection = document.getElementById('discountSection');
    const finalUnitPriceSection = document.getElementById('finalUnitPriceSection');
    
    if (discount > 0) {
        discountSection.style.display = 'flex';
        finalUnitPriceSection.style.display = 'flex';
        
        document.getElementById('discountPercentage').textContent = discount;
        document.getElementById('discountAmount').textContent = discountAmountPerUnit.toFixed(2);
        document.getElementById('finalUnitPrice').textContent = finalUnitPrice.toFixed(2);
    } else {
        discountSection.style.display = 'none';
        finalUnitPriceSection.style.display = 'none';
    }
    
    // Mostrar siempre el precio por unidad
    document.getElementById('unitPrice').textContent = priceBeforeDiscount.toFixed(2);
    
    // Mostrar cantidad final
    document.getElementById('finalQuantity').textContent = quantity;
    
    // Calcular precio final total
    const totalToCharge = finalUnitPrice * quantity;

    // Mostrar resultados
    document.getElementById('materialCost').textContent = (materialCostPerUnit * quantity).toFixed(2);
    document.getElementById('electricityCost').textContent = (electricityCostPerUnit * quantity).toFixed(2);
    document.getElementById('wearCost').textContent = (wearCostPerUnit * quantity).toFixed(2);
    document.getElementById('errorCost').textContent = ((baseCostPerUnit * errorMargin/100) * quantity).toFixed(2);
    document.getElementById('totalCost').textContent = (costWithErrorPerUnit * quantity).toFixed(2);
    document.getElementById('profitCost').textContent = ((costWithErrorPerUnit * profitMargin/100) * quantity).toFixed(2);
    document.getElementById('finalPrice').textContent = totalToCharge.toFixed(2);
    
    // Mostrar sección de resultados con animación
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.style.animation = 'fadeIn 0.5s ease';
}

function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const isWholesale = document.getElementById('customerType').value === 'wholesale';
        
        // Configuración inicial
        doc.setProperties({
            title: 'Cotización Tessari Tech',
            subject: 'Impresión 3D',
            author: 'Tessari Tech',
            keywords: 'cotización, impresión 3d',
            creator: 'Calculadora 3D'
        });

        // Logo (reemplaza con tu imagen base64 o comenta esta línea)
        // doc.addImage('data:image/png;base64,...', 'PNG', 15, 10, 40, 20);
        
        // Encabezado
        doc.setFillColor(67, 97, 238);
        doc.rect(0, 35, pageWidth, 10, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255);
        doc.setFont('helvetica', 'bold');
        doc.text('COTIZACIÓN DE IMPRESIÓN 3D', 105, 41, { align: 'center' });
        
        // Información de contacto
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('Tel: +56 9 8765 4321 | contacto@tessari.tech | www.tessari.tech', 105, 48, { align: 'center' });

        // Cuerpo del documento
        let yPosition = 60;
        
        // Información básica
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text(`Cotización #${Math.floor(Math.random() * 1000)}`, 14, yPosition);
        doc.text(new Date().toLocaleDateString(), pageWidth - 14, yPosition, { align: 'right' });
        
        yPosition += 20;

        // Obtener valores para la tabla
        const unitPrice = document.getElementById('unitPrice').textContent;
        const discountPercentage = isWholesale ? document.getElementById('discountPercentage').textContent : '0';
        const discountAmount = isWholesale ? document.getElementById('discountAmount').textContent : '0.00';
        const finalUnitPrice = isWholesale ? document.getElementById('finalUnitPrice').textContent : unitPrice;
        const quantity = document.getElementById('finalQuantity').textContent;
        const totalPrice = document.getElementById('finalPrice').textContent;

        // Crear tabla dinámica
        let tableData = [
            ['CANTIDAD', `${quantity} unidades`],
            ['PRECIO POR UNIDAD', `$${formatNumber(unitPrice)}`]
        ];

        // Agregar sección de descuento si es mayorista
        if (isWholesale) {
            tableData.push(
                ['DESCUENTO POR VOLUMEN', `${discountPercentage}% (-$${formatNumber(discountAmount)})`],
                ['PRECIO FINAL', `$${formatNumber(finalUnitPrice)}`]
            );
        }

        tableData.push(['TOTAL A PAGAR', `$${formatNumber(totalPrice)}`]);

        // Generar tabla
        doc.autoTable({
            startY: yPosition,
            body: tableData,
            theme: 'grid',
            styles: { 
                fontSize: 12,
                cellPadding: 8,
                textColor: [40, 40, 40],
                lineColor: [200, 200, 200],
                lineWidth: 0.5
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: '60%' },
                1: { halign: 'right', cellWidth: '40%' }
            },
            margin: { top: yPosition, left: 14, right: 14 },
            didDrawCell: (data) => {
                // Resaltar fila de TOTAL
                if (data.row.index === tableData.length - 1) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(
                        data.cell.x,
                        data.cell.y,
                        data.cell.width,
                        data.cell.height,
                        'F'
                    );
                }
            }
        });

        // Firma y notas
        const finalY = doc.autoTable.previous.finalY + 20;
        doc.setLineWidth(0.5);
        doc.line(14, finalY, 60, finalY);
        doc.setFontSize(10);
        doc.text('Firma autorizada', 14, finalY + 5);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('* Validez: 15 días | Garantía: 30 días | Precios en CLP', 14, finalY + 15);

        // Guardar PDF
        doc.save(`Cotizacion_TessariTech_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error: Primero debes calcular los costos antes de generar el PDF');
    }
}

function formatNumber(value) {
    return parseFloat(value).toLocaleString('es-CL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}