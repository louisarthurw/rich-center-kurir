import { sql } from "../config/db.js";

export const getAnalyticsData = async (req, res) => {
  try {
    // users role = 'customer'
    const customersResult = await sql`
      SELECT COUNT(*) FROM users WHERE role = 'customer'
    `;
    const customers = Number(customersResult[0].count);

    // services status = 'active'
    const servicesResult = await sql`
      SELECT COUNT(*) FROM services WHERE status = 'active'
    `;
    const services = Number(servicesResult[0].count);

    // couriers status = 'active'
    const couriersResult = await sql`
      SELECT COUNT(*) FROM couriers WHERE status = 'active'
    `;
    const couriers = Number(couriersResult[0].count);

    // total delivery addresses from orders = 'paid'
    const addressCountResult = await sql`
      SELECT COALESCE(SUM(total_address), 0) as address_count FROM orders WHERE payment_status = 'paid'
    `;
    const addresses = Number(addressCountResult[0].address_count);

    // orders payment_status = 'paid'
    const totalOrdersResult = await sql`
      SELECT COUNT(*) FROM orders WHERE payment_status = 'paid'
    `;
    const totalOrders = Number(totalOrdersResult[0].count);

    // total revenue from orders = 'paid'
    const totalRevenueResult = await sql`
      SELECT COALESCE(SUM(subtotal), 0) as revenue FROM orders WHERE payment_status = 'paid'
    `;
    const totalRevenue = Number(totalRevenueResult[0].revenue);

    res.status(200).json({
      success: true,
      data: {
        customers,
        services,
        couriers,
        addresses,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getSalesData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: "start date and end date are required" });
    }

    const salesResult = await sql`
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        COUNT(*) as sales,
        COALESCE(SUM(subtotal), 0) as revenue
      FROM orders
      WHERE date BETWEEN ${startDate} AND ${endDate}
      AND payment_status = 'paid'
      GROUP BY date
      ORDER BY date ASC
    `;

    const salesMap = {};
    salesResult.forEach(row => {
      salesMap[row.date] = {
        sales: Number(row.sales),
        revenue: Number(row.revenue),
      };
    });

    const dateArray = getDatesInRange(startDate, endDate);
    const salesData = dateArray.map(date => ({
      date,
      sales: salesMap[date]?.sales || 0,
      revenue: salesMap[date]?.revenue || 0,
    }));

    res.status(200).json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    console.log("Error in getSalesData controller", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

function getDatesInRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates = [];

  while (startDate <= endDate) {
    dates.push(startDate.toISOString().split("T")[0]);
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
}


