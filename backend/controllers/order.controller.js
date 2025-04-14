import { sql } from "../config/db.js";
import dotenv from "dotenv";
import Midtrans from "midtrans-client";
import crypto from "crypto";

dotenv.config();

export const getAllOrders = async (req, res) => {
  try {
    const orders = await sql`
      SELECT 
        orders.*, 
        services.name AS service_name, 
        services.image AS service_image, 
        services.price AS service_price
      FROM orders
      JOIN services ON orders.service_id = services.id
      ORDER BY orders.id DESC
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
      ORDER BY od.id ASC
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
    const service = await sql`SELECT * FROM services WHERE id = ${service_id}`;

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
      ) RETURNING *;
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

    // create payment midtrans
    const secret = process.env.MIDTRANS_SERVER_KEY;
    const encodedSecret = Buffer.from(secret).toString("base64");

    const response = await fetch(
      `https://app.sandbox.midtrans.com/snap/v1/transactions`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedSecret}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: newOrder[0].subtotal,
          },
          item_details: [
            {
              id: service[0].id,
              name: service[0].name,
              price: service[0].price,
              quantity: newOrder[0].total_address,
            },
          ],
        }),
      }
    );

    const snapData = await response.json();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order_id: orderId,
      snap_token: snapData.token,
    });
  } catch (error) {
    console.log("Error in createOrder controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.body;

    console.log(id);

    const order = await sql`SELECT * FROM orders WHERE id = ${id}`;

    console.log(order);
    if (order.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    await sql`DELETE FROM order_details WHERE order_id = ${id}`;

    await sql`DELETE FROM orders WHERE id = ${id}`;

    res.status(200).json({
      success: true,
      message: `Order with ID ${id} and its details have been deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in deleteOrder controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleMidtransWebhook = async (req, res) => {
  try {
    const {
      order_id,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      status_code,
      gross_amount,
      signature_key: signatureKeyFromMidtrans,
    } = req.body;


    // Buat signature_key kita sendiri
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const rawSignature = order_id + status_code + gross_amount + serverKey;
    const generatedSignatureKey = crypto
      .createHash("sha512")
      .update(rawSignature)
      .digest("hex");

    // Verifikasi signature
    if (signatureKeyFromMidtrans !== generatedSignatureKey) {
      console.warn("Invalid signature key from Midtrans");
      return res.status(403).json({ success: false, error: "Invalid signature key" });
    }

    // Tentukan payment status berdasarkan status dari Midtrans
    let paymentStatus = "waiting";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        paymentStatus = "paid";
      } else {
        paymentStatus = "waiting";
      }
    } else if (transactionStatus === "settlement") {
      paymentStatus = "paid";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      paymentStatus = "failed";
    } else if (transactionStatus === "pending") {
      paymentStatus = "waiting";
    }

    // Cek apakah order ada
    const order = await sql`SELECT * FROM orders WHERE id = ${order_id}`;
    if (order.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Update payment status
    await sql`
      UPDATE orders
      SET payment_status = ${paymentStatus}
      WHERE id = ${order_id}
    `;

    // Jika gagal, update semua address_status jadi 'cancelled'
    if (paymentStatus === "failed") {
      await sql`
        UPDATE order_details
        SET address_status = 'cancelled'
        WHERE order_id = ${order_id}
      `;
    }

    res.status(200).json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.error("Error in Midtrans webhook:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


export const assignKurirManual = async (req, res) => {
  const { delivery_details } = req.body;

  try {
    for (const detail of delivery_details) {
      const { id, courier_id } = detail;

      await sql`
          UPDATE order_details
          SET courier_id = ${courier_id}
          WHERE id = ${id}
        `;
    }

    res.status(200).json({
      success: true,
      message: "Courier assignment updated successfully.",
      data: delivery_details,
    });
  } catch (error) {
    console.log("Error in assignKurirManual controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
