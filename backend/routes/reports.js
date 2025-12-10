// Product Reports Route - Generate CSV reports for admin
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');
const { verifyAdmin } = require('../middleware/auth');

// Helper function to convert array of objects to CSV
function convertToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }
  
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header.toLowerCase().replace(/ /g, '_')] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Calculate date ranges
function getDateRange(rangeType, startDate, endDate) {
  const now = new Date();
  let start, end;
  
  switch (rangeType) {
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
      break;
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
      break;
    case 'custom':
      start = new Date(startDate);
      end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(0);
      end = now;
  }
  
  return { start, end };
}

// GET /api/admin/reports/products - Generate product report
router.get('/products', verifyAdmin, async (req, res) => {
  try {
    const { productId, dateRange, startDate, endDate } = req.query;
    
    console.log('📊 Generating product report:', { productId, dateRange, startDate, endDate });
    
    // Get date range
    const { start, end } = getDateRange(dateRange, startDate, endDate);
    
    // Build product query
    const productQuery = productId ? { _id: productId } : {};
    
    // Fetch products
    const products = await Product.find(productQuery).lean();
    
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, msg: 'No products found' });
    }
    
    // Build report data
    const reportData = [];
    
    for (const product of products) {
      // Get orders for this product within date range
      const orders = await Order.find({
        'items.productId': product._id,
        createdAt: { $gte: start, $lte: end }
      }).lean();
      
      // Calculate sales metrics
      let totalQuantitySold = 0;
      let totalRevenue = 0;
      let orderCount = orders.length;
      
      orders.forEach(order => {
        const item = order.items.find(i => i.productId.toString() === product._id.toString());
        if (item) {
          totalQuantitySold += item.quantity;
          totalRevenue += item.price * item.quantity;
        }
      });
      
      // Get current stock value
      const currentStockValue = product.stock * product.price;
      
      reportData.push({
        product_id: product._id,
        product_name: product.name,
        category: product.category,
        brand: product.brand || 'N/A',
        current_price: product.price.toFixed(2),
        original_price: product.originalPrice ? product.originalPrice.toFixed(2) : 'N/A',
        current_stock: product.stock,
        stock_status: product.stock > 0 ? 'In Stock' : 'Out of Stock',
        current_stock_value: currentStockValue.toFixed(2),
        quantity_sold: totalQuantitySold,
        total_revenue: totalRevenue.toFixed(2),
        number_of_orders: orderCount,
        average_order_value: orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : '0.00',
        rating: product.rating || 'N/A',
        featured: product.featured ? 'Yes' : 'No',
        created_at: new Date(product.createdAt).toLocaleDateString(),
        last_updated: new Date(product.updatedAt).toLocaleDateString()
      });
    }
    
    // Define CSV headers
    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Brand',
      'Current Price',
      'Original Price',
      'Current Stock',
      'Stock Status',
      'Current Stock Value',
      'Quantity Sold',
      'Total Revenue',
      'Number of Orders',
      'Average Order Value',
      'Rating',
      'Featured',
      'Created At',
      'Last Updated'
    ];
    
    // Convert to CSV
    const csv = convertToCSV(reportData, headers);
    
    // Set headers for file download
    const filename = productId 
      ? `product_report_${productId}_${Date.now()}.csv`
      : `all_products_report_${Date.now()}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
    
    console.log('✅ Report generated successfully:', filename);
  } catch (err) {
    console.error('❌ Report generation error:', err);
    res.status(500).json({ success: false, msg: 'Failed to generate report', error: err.message });
  }
});

// GET /api/admin/reports/summary - Get quick summary stats
router.get('/summary', verifyAdmin, async (req, res) => {
  try {
    const { dateRange, startDate, endDate } = req.query;
    const { start, end } = getDateRange(dateRange, startDate, endDate);
    
    // Get all products
    const products = await Product.find().lean();
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.stock > 0).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    
    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    }).lean();
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate total items sold
    const totalItemsSold = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    res.json({
      success: true,
      summary: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        totalStockValue: totalStockValue.toFixed(2),
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        avgOrderValue: avgOrderValue.toFixed(2),
        totalItemsSold,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });
  } catch (err) {
    console.error('❌ Summary error:', err);
    res.status(500).json({ success: false, msg: 'Failed to get summary', error: err.message });
  }
});

module.exports = router;
