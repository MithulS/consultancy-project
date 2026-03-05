// Product Reports Component - Download reports with various filters
import React, { useState, useEffect, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductReports({ onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('all'); // 'all' or 'individual'
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'monthly', 'yearly', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('csv'); // 'csv' or 'pdf'
  const [message, setMessage] = useState('');

  const modalRef = useRef(null);
  useFocusTrap(modalRef, true, onClose);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch(`${API}/api/products?limit=1000`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  }

  function showMessage(msg, duration = 3000) {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }

  // Parse CSV text into [headers[], rows[][]] 
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      const cells = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { cells.push(current); current = ''; }
        else { current += ch; }
      }
      cells.push(current);
      return cells;
    });
  }

  async function buildPDF(csvText, filename, summaryData = null) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) { showMessage('\u274c No data to generate PDF'); return; }

    const headers = rows[0];
    const body = rows.slice(1);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

    // ── Color palette ──
    const colors = {
      primary: [15, 30, 56],       // Dark navy
      accent: [59, 130, 246],      // Blue
      success: [16, 185, 129],     // Green
      warning: [245, 158, 11],     // Amber
      danger: [239, 68, 68],       // Red
      lightBg: [248, 250, 252],    // Slate-50
      border: [226, 232, 240],     // Slate-200
      textDark: [30, 41, 59],      // Slate-800
      textMuted: [100, 116, 139],  // Slate-500
    };

    // ── Helper: draw rounded rect ──
    const roundedRect = (x, y, w, h, r, fillColor) => {
      doc.setFillColor(...fillColor);
      doc.roundedRect(x, y, w, h, r, r, 'F');
    };

    // ── Helper: add page footer ──
    const addFooter = (pageNum, totalPages) => {
      // Footer line
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.5);
      doc.line(30, pageH - 30, pageW - 30, pageH - 30);
      // Left: company
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...colors.textMuted);
      doc.text('Sri Amman Traders | Hardware, Electrical, Plumbing & Paints', 30, pageH - 18);
      // Center: confidential
      doc.setFont('helvetica', 'italic');
      doc.text('Confidential - For internal use only', pageW / 2, pageH - 18, { align: 'center' });
      // Right: page number
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${pageNum} of ${totalPages}`, pageW - 30, pageH - 18, { align: 'right' });
    };

    // ══════════════════════════════════════
    //  PAGE 1: COVER / SUMMARY
    // ══════════════════════════════════════

    // ── Header banner ──
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageW, 80, 'F');
    // Accent stripe
    doc.setFillColor(...colors.accent);
    doc.rect(0, 80, pageW, 4, 'F');

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text('Sri Amman Traders', 40, 38);
    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(180, 200, 230);
    doc.text('Hardware, Electrical, Plumbing & Paints', 40, 56);
    // Report type badge on the right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const reportLabel = reportType === 'individual' ? 'INDIVIDUAL PRODUCT REPORT' : 'ALL PRODUCTS REPORT';
    doc.text(reportLabel, pageW - 40, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 230);
    doc.text(`Generated: ${now}`, pageW - 40, 52, { align: 'right' });
    const rangeLabel = dateRange === 'all' ? 'All Time' : dateRange === 'monthly' ? 'This Month' : dateRange === 'yearly' ? 'This Year' : `${startDate} to ${endDate}`;
    doc.text(`Period: ${rangeLabel}`, pageW - 40, 66, { align: 'right' });

    // ── Summary Section Title ──
    let curY = 105;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...colors.textDark);
    doc.text('Report Summary', 40, curY);
    curY += 8;
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(2);
    doc.line(40, curY, 160, curY);
    curY += 20;

    // ── Calculate summary stats from data ──
    // Header indices
    const hIdx = {};
    headers.forEach((h, i) => { hIdx[h.toLowerCase().replace(/ /g, '_')] = i; });

    const totalProducts = body.length;
    let totalRevenue = 0, totalSold = 0, totalOrders = 0, totalStockValue = 0;
    let inStockCount = 0, outOfStockCount = 0, lowStockCount = 0;
    const categoryMap = {};

    body.forEach(row => {
      const rev = parseFloat(row[hIdx['total_revenue']] || 0);
      const sold = parseInt(row[hIdx['quantity_sold']] || 0);
      const stockVal = parseFloat(row[hIdx['current_stock_value']] || 0);
      const stock = parseInt(row[hIdx['current_stock']] || 0);
      const cat = row[hIdx['category']] || 'Other';

      totalRevenue += rev;
      totalSold += sold;
      totalStockValue += stockVal;

      if (stock === 0) outOfStockCount++;
      else if (stock <= 10) lowStockCount++;
      else inStockCount++;

      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    // Use summary API data for accurate unique order count if available
    if (summaryData) {
      totalOrders = summaryData.totalOrders || 0;
      // Cross-check: use summary revenue if per-product sum seems off
      if (summaryData.totalItemsSold !== undefined) totalSold = summaryData.totalItemsSold;
    } else {
      // Fallback: sum per-product order counts (may overcount multi-item orders)
      body.forEach(row => {
        totalOrders += parseInt(row[hIdx['number_of_orders']] || 0);
      });
    }

    // ── Summary cards (2 rows of 4) ──
    const cardW = (pageW - 110) / 4;
    const cardH = 58;
    const cardGap = 10;
    const summaryCards = [
      { label: 'Total Products', value: totalProducts.toString(), icon: '', color: colors.accent },
      { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: '', color: colors.success },
      { label: 'Items Sold', value: totalSold.toLocaleString(), icon: '', color: [139, 92, 246] },
      { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: '', color: [236, 72, 153] },
      { label: 'In Stock', value: inStockCount.toString(), icon: '', color: colors.success },
      { label: 'Low Stock (<=10)', value: lowStockCount.toString(), icon: '', color: colors.warning },
      { label: 'Out of Stock', value: outOfStockCount.toString(), icon: '', color: colors.danger },
      { label: 'Inventory Value', value: `Rs.${totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: '', color: colors.primary },
    ];

    summaryCards.forEach((card, i) => {
      const col = i % 4;
      const row2 = Math.floor(i / 4);
      const cx = 40 + col * (cardW + cardGap);
      const cy = curY + row2 * (cardH + cardGap);

      // Card background
      roundedRect(cx, cy, cardW, cardH, 6, colors.lightBg);
      // Left color bar
      doc.setFillColor(...card.color);
      doc.roundedRect(cx, cy, 4, cardH, 2, 2, 'F');

      // Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...colors.textDark);
      doc.text(card.value, cx + 16, cy + 25);

      // Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.textMuted);
      doc.text(card.label, cx + 16, cy + 42);
    });

    curY += 2 * (cardH + cardGap) + 20;

    // ── Category Breakdown ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.textDark);
    doc.text('Category Breakdown', 40, curY);
    curY += 14;

    const catEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    const catColors = [colors.accent, colors.success, [139, 92, 246], colors.warning, colors.danger, [236, 72, 153], colors.primary, [20, 184, 166]];

    // Category bar chart (left half only)
    const barMaxW = 120;
    const barH = 16;
    const barGap = 6;
    const maxCatVal = Math.max(...catEntries.map(c => c[1]), 1);
    const barStartX = 130;

    catEntries.slice(0, 8).forEach(([cat, count], i) => {
      const barW = Math.max((count / maxCatVal) * barMaxW, 20);
      const by = curY + i * (barH + barGap);
      const color = catColors[i % catColors.length];

      // Category label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.textDark);
      doc.text(cat, 40, by + 11);

      // Bar background
      roundedRect(barStartX, by, barMaxW, barH, 3, [241, 245, 249]);
      // Bar fill
      roundedRect(barStartX, by, barW, barH, 3, color);

      // Count
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.textDark);
      doc.text(`${count}`, barStartX + barMaxW + 8, by + 11);
    });

    // ── Vertical separator ──
    const sepX = pageW / 2 + 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(sepX, curY - 16, sepX, curY + 8 * (barH + barGap));

    // ── Top 5 products (right side) ──
    const topX = pageW / 2 + 20;
    const topY = curY - 14;
    const hasSales = totalRevenue > 0;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.textDark);
    doc.text(hasSales ? 'Top Revenue Products' : 'Highest Value Products (by Price)', topX, topY);

    const revIdx = hIdx['total_revenue'];
    const nameIdx = hIdx['product_name'];
    const priceIdx = hIdx['current_price'];
    const stockValueIdx = hIdx['current_stock_value'];
    const soldIdx = hIdx['quantity_sold'];
    
    // If there are sales, rank by revenue; otherwise rank by stock value (price * stock)
    const topProducts = [...body]
      .map(r => ({ 
        name: r[nameIdx] || '', 
        revenue: parseFloat(r[revIdx] || 0),
        price: parseFloat(r[priceIdx] || 0),
        stockValue: parseFloat(r[stockValueIdx] || 0),
        sold: parseInt(r[soldIdx] || 0)
      }))
      .sort((a, b) => hasSales ? b.revenue - a.revenue : b.stockValue - a.stockValue)
      .slice(0, 5);

    topProducts.forEach((p, i) => {
      const ty = topY + 18 + i * 28;
      const rank = i + 1;

      // Rank circle
      const rankColor = i === 0 ? [255, 215, 0] : i === 1 ? [192, 192, 192] : i === 2 ? [205, 127, 50] : colors.lightBg;
      roundedRect(topX, ty - 10, 22, 22, 11, rankColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(i < 3 ? 255 : 60, i < 3 ? 255 : 60, i < 3 ? 255 : 60);
      doc.text(`${rank}`, topX + 11, ty + 4, { align: 'center' });

      // Product name (truncated)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.textDark);
      const truncName = p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name;
      doc.text(truncName, topX + 30, ty + 3);

      // Value - show revenue if sold, price if not sold, or stock value if no sales at all
      doc.setFont('helvetica', 'bold');
      if (hasSales && p.revenue > 0) {
        doc.setTextColor(...colors.success);
        doc.text(`Rs.${p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 40, ty + 3, { align: 'right' });
      } else if (hasSales && p.revenue === 0) {
        doc.setTextColor(...colors.textMuted);
        doc.text('No sales', pageW - 40, ty + 3, { align: 'right' });
      } else {
        doc.setTextColor(...colors.accent);
        doc.text(`Rs.${p.stockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 40, ty + 3, { align: 'right' });
      }
    });

    // ══════════════════════════════════════
    //  PAGE 2+: DETAILED TABLE
    // ══════════════════════════════════════
    doc.addPage();

    // Simplified headers for readability
    const displayHeaders = ['#', 'Product Name', 'Category', 'Brand', 'Price (Rs.)', 'Stock', 'Status', 'Sold', 'Revenue (Rs.)', 'Orders', 'Rating'];

    // Map body to simplified rows
    const tableBody = body.map((row, i) => {
      const stock = parseInt(row[hIdx['current_stock']] || 0);
      const price = parseFloat(row[hIdx['current_price']] || 0);
      const revenue = parseFloat(row[hIdx['total_revenue']] || 0);
      const sold = parseInt(row[hIdx['quantity_sold']] || 0);
      const orders = parseInt(row[hIdx['number_of_orders']] || 0);
      const status = stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock';

      return [
        (i + 1).toString(),
        (row[nameIdx] || '').substring(0, 40),
        row[hIdx['category']] || '',
        row[hIdx['brand']] || '',
        `Rs.${price.toLocaleString('en-IN')}`,
        stock.toString(),
        status,
        sold.toLocaleString(),
        `Rs.${revenue.toLocaleString('en-IN')}`,
        orders.toString(),
        row[hIdx['rating']] || 'N/A'
      ];
    });

    // Page header for table pages
    const drawTablePageHeader = () => {
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageW, 45, 'F');
      doc.setFillColor(...colors.accent);
      doc.rect(0, 45, pageW, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('Product Details - Detailed Breakdown', 30, 28);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 200, 230);
      doc.text(`${totalProducts} products | ${rangeLabel} | ${now}`, pageW - 30, 28, { align: 'right' });
    };

    drawTablePageHeader();

    autoTable(doc, {
      head: [displayHeaders],
      body: tableBody,
      startY: 58,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 5,
        overflow: 'linebreak',
        lineColor: colors.border,
        lineWidth: 0.5,
        textColor: colors.textDark,
      },
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 6,
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },     // #
        1: { cellWidth: 'auto' },                     // Name
        2: { cellWidth: 70 },                          // Category
        3: { cellWidth: 55 },                          // Brand
        4: { halign: 'right', cellWidth: 55 },         // Price
        5: { halign: 'center', cellWidth: 35 },        // Stock
        6: { halign: 'center', cellWidth: 55 },        // Status
        7: { halign: 'center', cellWidth: 35 },        // Sold
        8: { halign: 'right', cellWidth: 65 },         // Revenue
        9: { halign: 'center', cellWidth: 38 },        // Orders
        10: { halign: 'center', cellWidth: 35 },       // Rating
      },
      margin: { left: 25, right: 25, top: 58, bottom: 40 },
      didParseCell: (data) => {
        // Color-code stock status
        if (data.section === 'body' && data.column.index === 6) {
          const val = data.cell.raw;
          if (val === 'Out of Stock') {
            data.cell.styles.textColor = colors.danger;
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Low Stock') {
            data.cell.styles.textColor = [180, 120, 0];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = colors.success;
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Bold revenue column
        if (data.section === 'body' && data.column.index === 8) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
      didDrawPage: (data) => {
        // Redraw header on each new page (page 2+)
        if (data.pageNumber > 1) {
          drawTablePageHeader();
        }
      }
    });

    // ── Add footers to all pages ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    doc.save(filename.replace('.csv', '.pdf'));
  }

  async function downloadReport() {
    console.log('📥 Download Report Started');
    console.log('Report Type:', reportType);
    console.log('Selected Product:', selectedProduct);
    console.log('Date Range:', dateRange);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    if (reportType === 'individual' && !selectedProduct) {
      showMessage('❌ Please select a product');
      return;
    }

    if (dateRange === 'custom' && (!startDate || !endDate)) {
      showMessage('❌ Please select both start and end dates');
      return;
    }

    if (dateRange === 'custom' && new Date(startDate) > new Date(endDate)) {
      showMessage('❌ Start date must be before end date');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      console.log('Token exists:', !!token);

      // Build query parameters
      const params = new URLSearchParams();
      if (reportType === 'individual') {
        params.append('productId', selectedProduct);
      }
      params.append('dateRange', dateRange);
      if (dateRange === 'custom') {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const url = `${API}/api/reports/products?${params.toString()}`;
      console.log('📡 Request URL:', url);

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📡 Response Status:', res.status);
      console.log('📡 Response OK:', res.ok);
      console.log('📡 Response Headers:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error Response:', errorText);
        throw new Error(`Failed to generate report: ${res.status} - ${errorText}`);
      }

      const blob = await res.blob();
      console.log('📦 Blob received, size:', blob.size, 'type:', blob.type);

      // Generate filename
      const productName = reportType === 'individual'
        ? products.find(p => p._id === selectedProduct)?.name.replace(/[^a-z0-9]/gi, '_')
        : 'All_Products';
      const dateStr = dateRange === 'custom'
        ? `${startDate}_to_${endDate}`
        : dateRange;
      const filename = `Product_Report_${productName}_${dateStr}_${Date.now()}.csv`;

      if (format === 'pdf') {
        // Fetch summary data for accurate unique order count
        let summaryData = null;
        try {
          const summaryParams = new URLSearchParams();
          summaryParams.append('dateRange', dateRange);
          if (dateRange === 'custom') {
            summaryParams.append('startDate', startDate);
            summaryParams.append('endDate', endDate);
          }
          const summaryRes = await fetch(`${API}/api/reports/summary?${summaryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (summaryRes.ok) {
            const summaryJson = await summaryRes.json();
            if (summaryJson.success) summaryData = summaryJson.summary;
          }
        } catch (e) {
          console.warn('Could not fetch summary, using CSV-derived values:', e);
        }

        // Build PDF from the CSV data client-side
        const csvText = await blob.text();
        await buildPDF(csvText, filename, summaryData);
        showMessage('✅ PDF downloaded successfully!');
      } else {
        // Standard CSV download
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        showMessage('✅ CSV downloaded successfully!');
      }

      console.log('✅ Download completed successfully');
    } catch (err) {
      console.error('❌ Download error:', err);
      console.error('❌ Error stack:', err.stack);
      showMessage(`❌ Failed to download report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.3s ease-out'
    },
    modal: {
      background: '#ffffff',
      borderRadius: '14px',
      padding: '14px 18px',
      width: '92%',
      maxWidth: '520px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      animation: 'scaleIn 0.3s ease-out',
      position: 'relative',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      paddingBottom: '6px',
      borderBottom: '2px solid #e2e8f0'
    },
    title: {
      fontSize: '16px',
      fontWeight: '800',
      color: '#1f2937',
      margin: 0
    },
    closeBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#64748b',
      padding: '0',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    section: {
      marginBottom: '6px',
    },
    label: {
      display: 'block',
      fontSize: '10px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    radioGroup: {
      display: 'flex',
      gap: '6px',
      marginBottom: '0'
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 10px',
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.3s',
      flex: 1,
      background: 'transparent'
    },
    radioOptionActive: {
      border: '2px solid #3b82f6',
      background: 'rgba(59, 130, 246, 0.1)',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
    },
    radio: {
      width: '14px',
      height: '14px',
      cursor: 'pointer'
    },
    radioLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#1f2937',
      cursor: 'pointer'
    },
    select: {
      width: '100%',
      padding: '5px 10px',
      fontSize: '12px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s',
      background: '#ffffff',
      color: '#1f2937',
      cursor: 'pointer'
    },
    dateGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px'
    },
    dateInput: {
      padding: '5px 10px',
      fontSize: '12px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s',
      background: '#ffffff',
      color: '#1f2937'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px'
    },
    button: {
      flex: 1,
      padding: '8px 14px',
      fontSize: '12px',
      fontWeight: '700',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    downloadBtn: {
      backgroundImage: format === 'pdf'
        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
        : 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      boxShadow: format === 'pdf'
        ? '0 4px 15px rgba(239, 68, 68, 0.35)'
        : '0 4px 15px rgba(102, 126, 234, 0.3)'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    message: {
      padding: '8px 12px',
      borderRadius: '8px',
      marginBottom: '6px',
      fontSize: '12px',
      fontWeight: '600',
      textAlign: 'center',
    },
    infoBox: {
      backgroundColor: 'rgba(102, 126, 234, 0.05)',
      border: '1px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '8px',
      padding: '6px 10px',
      marginTop: '6px'
    },
    infoTitle: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#667eea',
      marginBottom: '2px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    infoText: {
      fontSize: '10px',
      color: '#6b7280',
      lineHeight: '1.3',
      margin: '1px 0'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes staggeredGlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div style={styles.header}>
          <h2 id="modal-title" style={styles.title}>📊 Download Product Reports</h2>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fee2e2';
              e.target.style.color = '#dc2626';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b'
          }}>
            {message}
          </div>
        )}

        {/* Format Selection */}
        <div style={styles.section}>
          <label style={styles.label}>📄 Download Format</label>
          <div style={styles.radioGroup}>
            <div
              style={{
                ...styles.radioOption,
                ...(format === 'csv' ? styles.radioOptionActive : {})
              }}
              onClick={() => setFormat('csv')}
            >
              <input
                type="radio" name="format" value="csv"
                checked={format === 'csv'}
                onChange={e => setFormat(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>📊 CSV (Excel)</label>
            </div>
            <div
              style={{
                ...styles.radioOption,
                ...(format === 'pdf' ? { ...styles.radioOptionActive, border: '2px solid #ef4444', background: 'rgba(239,68,68,0.08)' } : {})
              }}
              onClick={() => setFormat('pdf')}
            >
              <input
                type="radio" name="format" value="pdf"
                checked={format === 'pdf'}
                onChange={e => setFormat(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>📑 PDF Document</label>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div style={styles.section}>
          <label style={styles.label}>📋 Report Type</label>
          <div style={styles.radioGroup}>
            <div
              style={{
                ...styles.radioOption,
                ...(reportType === 'all' ? styles.radioOptionActive : {})
              }}
              onClick={() => setReportType('all')}
            >
              <input
                type="radio"
                name="reportType"
                value="all"
                checked={reportType === 'all'}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>All Products</label>
            </div>
            <div
              style={{
                ...styles.radioOption,
                ...(reportType === 'individual' ? styles.radioOptionActive : {})
              }}
              onClick={() => setReportType('individual')}
            >
              <input
                type="radio"
                name="reportType"
                value="individual"
                checked={reportType === 'individual'}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>Individual Product</label>
            </div>
          </div>
        </div>

        {/* Product Selection (only for individual) */}
        {reportType === 'individual' && (
          <div style={{ ...styles.section, marginTop: '4px' }}>
            <label style={styles.label}>🏷️ Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={styles.select}
              onFocus={(e) => e.target.style.border = '2px solid #667eea'}
              onBlur={(e) => e.target.style.border = '2px solid #e5e7eb'}
            >
              <option value="">-- Choose a product --</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range Selection */}
        <div style={styles.section}>
          <label style={styles.label}>📅 Date Range</label>
          <div style={styles.radioGroup}>
            <div
              style={{
                ...styles.radioOption,
                ...(dateRange === 'all' ? styles.radioOptionActive : {})
              }}
              onClick={() => setDateRange('all')}
            >
              <input
                type="radio"
                name="dateRange"
                value="all"
                checked={dateRange === 'all'}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>All Time</label>
            </div>
            <div
              style={{
                ...styles.radioOption,
                ...(dateRange === 'monthly' ? styles.radioOptionActive : {})
              }}
              onClick={() => setDateRange('monthly')}
            >
              <input
                type="radio"
                name="dateRange"
                value="monthly"
                checked={dateRange === 'monthly'}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>This Month</label>
            </div>
            <div
              style={{
                ...styles.radioOption,
                ...(dateRange === 'yearly' ? styles.radioOptionActive : {})
              }}
              onClick={() => setDateRange('yearly')}
            >
              <input
                type="radio"
                name="dateRange"
                value="yearly"
                checked={dateRange === 'yearly'}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>This Year</label>
            </div>
          </div>
          <div
            style={{
              ...styles.radioOption,
              ...(dateRange === 'custom' ? styles.radioOptionActive : {}),
              marginTop: '6px'
            }}
            onClick={() => setDateRange('custom')}
          >
            <input
              type="radio"
              name="dateRange"
              value="custom"
              checked={dateRange === 'custom'}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.radio}
            />
            <label style={styles.radioLabel}>Custom Date Range</label>
          </div>
        </div>

        {/* Custom Date Inputs */}
        {dateRange === 'custom' && (
          <div style={styles.section}>
            <div style={styles.dateGroup}>
              <div>
                <label style={{ ...styles.label, fontSize: '12px' }}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.dateInput}
                  onFocus={(e) => e.target.style.border = '2px solid #667eea'}
                  onBlur={(e) => e.target.style.border = '2px solid #e5e7eb'}
                />
              </div>
              <div>
                <label style={{ ...styles.label, fontSize: '12px' }}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.dateInput}
                  onFocus={(e) => e.target.style.border = '2px solid #667eea'}
                  onBlur={(e) => e.target.style.border = '2px solid #e5e7eb'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div style={styles.infoBox}>
          <div style={styles.infoTitle}>
            <span>💡</span>
            <span>Report Details</span>
          </div>
          <p style={styles.infoText}>• Includes product details, stock levels, sales data & revenue</p>
          <p style={styles.infoText}>• All Time / Monthly / Yearly / Custom date range options</p>
          <p style={styles.infoText}>• CSV for spreadsheets, PDF for print-ready documents</p>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.cancelBtn }}
            onClick={onClose}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e5e7eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
          <button
            style={{ ...styles.button, ...styles.downloadBtn }}
            onClick={downloadReport}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? '⏳ Generating…' : format === 'pdf' ? '📑 Download PDF' : '📥 Download CSV'}
          </button>
        </div>
      </div>

    </div>
  );
}
