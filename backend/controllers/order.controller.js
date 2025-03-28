import { sql } from "../config/db.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await sql`
          SELECT * FROM orders
          ORDER BY id ASC
        `;

    console.log("fetched orders", orders);
    if (orders.length > 0) {
      res.status(200).json({ success: true, data: orders });
    } else {
      res
        .status(404)
        .json({ success: false, error: "No order found in database" });
    }
  } catch (error) {
    console.log("Error in getAllOrders controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const pickupDetails = await sql`
    SELECT 
      o.*, 
      s.name AS service_name, 
      s.image AS service_image, 
      s.price AS service_price
    FROM orders o
    JOIN services s ON o.service_id = s.id
    WHERE o.id = ${id}
  `;

    const deliveryDetails = await sql`
      SELECT 
        od.id,
        od.delivery_name,
        od.delivery_address,
        od.delivery_phone_number,
        od.sender_name,
        od.lat,
        od.long,
        od.courier_id,
        c.name AS courier_name,
        od.visit_order,
        od.proof_image,
        od.address_status
      FROM order_details od
      LEFT JOIN couriers c ON od.courier_id = c.id
      WHERE od.order_id = ${id}
    `;

    console.log(pickupDetails);

    if (pickupDetails.length > 0) {
      res.status(200).json({
        success: true,
        data: {
          pickup_details: pickupDetails[0],
          delivery_details: deliveryDetails,
        },
      });
    } else {
      res.status(404).json({ success: false, error: "Order not found" });
    }
  } catch (error) {
    console.log("Error in getOrderById controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getCustomerOrder = async (req, res) => {
  const id = req.user.id;

  try {
    const orders = await sql`
      SELECT 
        orders.*, 
        services.name AS service_name, 
        services.image AS service_image, 
        services.price AS service_price
      FROM orders
      JOIN services ON orders.service_id = services.id
      WHERE orders.user_id = ${id}
      ORDER BY orders.id DESC
    `;

    res.status(200).json({ success: true, data: orders });

    // if (orders.length > 0) {
    //   res.status(200).json({ success: true, data: orders });
    // } else {
    //   res
    //     .status(404)
    //     .json({ success: false, error: "Customer's order not found" });
    // }
  } catch (error) {
    console.log("Error in getUserOrder controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { service_id, user_id, pickupDetails, deliveryDetails } = req.body;

    // Ambil harga layanan
    const service =
      await sql`SELECT price FROM services WHERE id = ${service_id}`;

    if (service.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }

    const price_per_address = service[0].price;
    const total_address = deliveryDetails.length;
    const subtotal = price_per_address * total_address;

    // Insert ke tabel orders
    const newOrder = await sql`
      INSERT INTO orders (
        user_id, service_id, total_address, subtotal, date, pickup_name,
        pickup_phone_number, pickup_address, pickup_notes, type, weight,
        take_package_on_behalf_of, lat, long, courier_id, visit_order,
        proof_image, payment_status, order_status, address_status
      ) VALUES (
        ${user_id}, ${service_id}, ${total_address}, ${subtotal}, ${
      pickupDetails.date
    },
        ${pickupDetails.pickup_name}, ${pickupDetails.pickup_phone_number}, ${
      pickupDetails.pickup_address
    },
        ${pickupDetails.pickup_notes}, ${pickupDetails.type}, ${
      pickupDetails.weight
    },
        ${
          pickupDetails.take_package_on_behalf_of
        }, ${null}, ${null}, ${null}, ${null}, ${null}, 'waiting', 'waiting', 'waiting'
      ) RETURNING id;
    `;

    const orderId = newOrder[0].id;

    // Insert ke tabel order_details
    const orderDetailsQueries = deliveryDetails.map((detail) => {
      return sql`
        INSERT INTO order_details (
          order_id, delivery_name, delivery_address, delivery_phone_number,
          sender_name, lat, long, courier_id, visit_order, proof_image, address_status
        ) VALUES (
          ${orderId}, ${detail.delivery_name}, ${detail.delivery_address}, ${
        detail.delivery_phone_number
      },
          ${
            detail.sender_name
          }, ${null}, ${null}, ${null}, ${null}, ${null}, 'waiting'
        );
      `;
    });

    await Promise.all(orderDetailsQueries);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order_id: orderId,
    });
  } catch (error) {
    console.log("Error in createOrder controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
