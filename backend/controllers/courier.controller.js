import { sql } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { error } from "console";

dotenv.config();

export const getAllCouriers = async (req, res) => {
  try {
    const couriers = await sql`
        SELECT id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at FROM couriers
        ORDER BY 
          (status != 'active'), 
          id ASC
      `;

    console.log("fetched couriers", couriers);
    if (couriers.length > 0) {
      res.status(200).json({ success: true, data: couriers });
    } else {
      res
        .status(404)
        .json({ success: false, error: "No couriers found in database" });
    }
  } catch (error) {
    console.log("Error in getAllCouriers controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getAvailableCouriers = async (req, res) => {
  try {
    const couriers = await sql`
        SELECT id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at 
        FROM couriers
        WHERE availability_status = 'available' 
          AND role = 'regular' 
          AND status = 'active'
        ORDER BY id ASC
      `;

    // console.log("fetched couriers", couriers);
    res.status(200).json({ success: true, data: couriers });
    // if (couriers.length > 0) {
    //   res.status(200).json({ success: true, data: couriers });
    // } else {
    //   res
    //     .status(404)
    //     .json({ success: false, error: "No available couriers found in database" });
    // }
  } catch (error) {
    console.log("Error in getAvailableCouriers controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getCourierById = async (req, res) => {
  const { id } = req.params;

  try {
    const courier = await sql`
      SELECT id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at FROM couriers WHERE id = ${id}
    `;

    if (courier.length > 0) {
      res.status(200).json({ success: true, data: courier[0] });
    } else {
      res.status(404).json({ success: false, error: "Courier not found" });
    }
  } catch (error) {
    console.log("Error in getCourierById controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const addCourier = async (req, res) => {
  const { name, email, password, phone_number, address } = req.body;

  if (!name || !email || !password || !phone_number || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // check if courier exists
    const existingUser = await sql`
      SELECT * FROM couriers 
      WHERE email = ${email} OR phone_number = ${phone_number} 
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      if (existingUser[0].email === email) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      if (existingUser[0].phone_number === phone_number) {
        return res
          .status(400)
          .json({ message: "Phone number is already registered" });
      }
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // add new courier
    const newCourier = await sql`
      INSERT INTO couriers (name, email, password, phone_number, address, availability_status, role, status)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phone_number}, ${address}, 'available', 'regular', 'active')
      RETURNING id, name, email, password, phone_number, address, availability_status, role, status, created_at, updated_at
    `;

    console.log("New courier added:", newCourier);
    res.status(200).json({ success: true, data: newCourier[0] });
  } catch (error) {
    console.log("Error in addCourier controller", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const updateCourier = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number, address, role, status } = req.body;

  try {
    // Cek apakah kurir dengan email/phone_number yang baru sudah ada di database
    const existingCourier = await sql`
      SELECT id, email, phone_number FROM couriers 
      WHERE (email = ${email} OR phone_number = ${phone_number}) AND id != ${id}
    `;

    // Jika ada kurir lain yang memiliki email/phone_number yang sama, tolak update
    if (existingCourier.length > 0) {
      if (existingCourier.some((courier) => courier.email === email)) {
        return res
          .status(400)
          .json({ message: "Email is already registered by another courier" });
      }
      if (
        existingCourier.some((courier) => courier.phone_number === phone_number)
      ) {
        return res.status(400).json({
          message: "Phone number is already registered by another courier",
        });
      }
    }

    const updatedCourier = await sql`
      UPDATE couriers
      SET name = ${name}, email = ${email}, phone_number = ${phone_number}, address = ${address}, role = ${role}, status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at
    `;

    if (updatedCourier.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Courier not found" });
    }

    res.status(200).json({ success: true, data: updatedCourier[0] });
  } catch (error) {
    console.log("Error in updateCourier controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const changeAvailabilityStatus = async (req, res) => {
  const { id } = req.params;
  const { availability_status } = req.body;

  try {
    const updatedCourierStatus = await sql`
      UPDATE couriers
      SET availability_status = ${availability_status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at
    `;

    if (updatedCourierStatus.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Courier not found" });
    }

    res.status(200).json({ success: true, data: updatedCourierStatus[0] });
  } catch (error) {
    console.log("Error in changeAvailabilityStatus controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const changePasswordCourier = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedPassword = await sql`
      UPDATE couriers
      SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at
    `;

    if (updatedPassword.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Akun tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mengubah password, silahkan login kembali.",
    });
  } catch (error) {
    console.log("Error in changePasswordCourier controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getAllAssignmentCourier = async (req, res) => {
  const { courier_id } = req.params;

  try {
    const pickupDetails = await sql`
      SELECT 
        id AS order_id,
        user_id,
        service_id,
        total_address,
        subtotal,
        date,
        pickup_name,
        pickup_phone_number,
        pickup_address,
        pickup_notes,
        type,
        weight,
        take_package_on_behalf_of,
        lat,
        long,
        courier_id,
        visit_order,
        payment_status,
        order_status,
        created_at,
        updated_at
      FROM orders
      WHERE (',' || courier_id || ',') LIKE ${"%," + courier_id + ",%"}
        AND payment_status = 'paid'
      ORDER BY date DESC
    `;

    const grouped = {};

    for (const order of pickupDetails) {
      const dateKey = order.date?.toISOString?.();
      if (!dateKey) continue;

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          pickup_details: [],
          delivery_details: [],
        };
      }

      grouped[dateKey].pickup_details.push(order);

      const delivery = await sql`
        SELECT 
          id AS order_detail_id,
          order_id,
          delivery_name,
          delivery_address,
          delivery_phone_number,
          sender_name,
          lat,
          long,
          courier_id,
          visit_order,
          proof_image,
          address_status,
          created_at,
          updated_at
        FROM order_details
        WHERE order_id = ${order.order_id} AND courier_id = ${courier_id}
        ORDER BY visit_order ASC NULLS LAST
      `;

      grouped[dateKey].delivery_details.push(...delivery);
    }

    res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.log("Error in getAllAssignmentCourier controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getAssignmentCourierByDate = async (req, res) => {
  const { courier_id, date } = req.params;

  try {
    const pickupDetails = await sql`
      SELECT
        id AS order_id,
        user_id,
        service_id,
        total_address,
        subtotal,
        date,
        pickup_name,
        pickup_phone_number,
        pickup_address,
        pickup_notes,
        type,
        weight,
        take_package_on_behalf_of,
        lat,
        long,
        courier_id,
        visit_order,
        payment_status,
        order_status,
        created_at,
        updated_at
      FROM orders
      WHERE (',' || courier_id || ',') LIKE ${"%," + courier_id + ",%"}
        AND DATE(date) = ${date}
        AND payment_status = 'paid'
      ORDER BY date DESC
    `;

    const groupedPickup = [];
    const groupedDelivery = [];

    for (const order of pickupDetails) {
      groupedPickup.push(order);

      const delivery = await sql`
        SELECT
          id AS order_detail_id,
          order_id,
          delivery_name,
          delivery_address,
          delivery_phone_number,
          sender_name,
          lat,
          long,
          cluster_centroid,
          courier_id,
          visit_order,
          proof_image,
          address_status,
          initial_coordinate,
          proof_coordinate,
          total_travel_time,
          created_at,
          updated_at
        FROM order_details
        WHERE order_id = ${order.order_id} AND courier_id = ${courier_id}
      `;

      groupedDelivery.push(delivery);
    }

    res.status(200).json({
      success: true,
      data: {
        pickup_details: groupedPickup,
        delivery_details: groupedDelivery,
      },
    });
  } catch (error) {
    console.log("Error in getAssignmentCourierByDate controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getAssignmentCourierByOrderId = async (req, res) => {
  const { courier_id, order_id } = req.params;

  try {
    const pickupDetails = await sql`
      SELECT
        id AS order_id,
        user_id,
        service_id,
        total_address,
        subtotal,
        date,
        pickup_name,
        pickup_phone_number,
        pickup_address,
        pickup_notes,
        type,
        weight,
        take_package_on_behalf_of,
        lat,
        long,
        courier_id,
        visit_order,
        payment_status,
        order_status,
        created_at,
        updated_at
      FROM orders
      WHERE (',' || courier_id || ',') LIKE ${"%," + courier_id + ",%"}
        AND id = ${order_id}
        AND payment_status = 'paid'
    `;

    const groupedPickup = pickupDetails;
    const groupedDelivery = [];

    for (const order of pickupDetails) {
      const delivery = await sql`
        SELECT
          id AS order_detail_id,
          order_id,
          delivery_name,
          delivery_address,
          delivery_phone_number,
          sender_name,
          lat,
          long,
          cluster_centroid,
          courier_id,
          visit_order,
          proof_image,
          address_status,
          initial_coordinate,
          proof_coordinate,
          total_travel_time,
          created_at,
          updated_at
        FROM order_details
        WHERE order_id = ${order.order_id} AND courier_id = ${courier_id}
      `;

      groupedDelivery.push(delivery);
    }

    res.status(200).json({
      success: true,
      data: {
        pickup_details: groupedPickup,
        delivery_details: groupedDelivery,
      },
    });
  } catch (error) {
    console.log("Error in getAssignmentCourierByOrderId controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const uploadBuktiFoto = async (req, res) => {
  const { id, image, proof_coordinate, data } = req.body;

  try {
    const allDeliveryDetails = data.delivery_details.flat();
    const courierId = allDeliveryDetails[0].courier_id;

    // Urutkan delivery details berdasarkan visit_order
    const pendingDeliveries = allDeliveryDetails
      .filter(
        (d) => d.courier_id === courierId && d.address_status !== "delivered"
      )
      .sort((a, b) => a.visit_order - b.visit_order);

    // Memastikan yang bisa diupload bukti foto adalah yang visit_order terendah
    const deliveryToUpload = pendingDeliveries[0];
    console.log("lokasi visit order terendah: ", deliveryToUpload);
    if (parseInt(id) !== deliveryToUpload.order_detail_id) {
      return res.status(400).json({
        success: false,
        error: "Ada lokasi yang belum dikunjungi, dilarang mendahului rute",
      });
    }

    // Upload gambar ke cloudinary
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "bukti_foto",
      });
    }
    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      return res.status(400).json({
        success: false,
        message: "Gagal mengunggah gambar ke Cloudinary.",
      });
    }

    // Update order_details di database
    await sql`
      UPDATE order_details
      SET
        proof_image = ${cloudinaryResponse.secure_url},
        proof_coordinate = ${proof_coordinate},
        address_status = 'delivered',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    const nextDelivery =
      pendingDeliveries.length > 1 ? pendingDeliveries[1] : null;
    console.log("lokasi selanjutnya: ", nextDelivery);

    // Jika ada lokasi pengiriman selanjutnya, update address_status menjadi 'ongoing'
    if (nextDelivery) {
      await sql`
        UPDATE order_details
        SET address_status = 'ongoing', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${nextDelivery.order_detail_id}
      `;
    }

    // Cek status order
    const orderId = deliveryToUpload.order_id;
    const orderDetailsStatus = await sql`
      SELECT address_status
      FROM order_details
      WHERE order_id = ${orderId}
    `;

    console.log("order detail status:", orderDetailsStatus);

    const statuses = orderDetailsStatus.map((row) => row.address_status);

    let newOrderStatus = "waiting";

    const allWaiting = statuses.every((status) => status === "waiting");
    const allDelivered = statuses.every((status) => status === "delivered");
    const hasWaiting = statuses.includes("waiting");
    const hasOngoing = statuses.includes("ongoing");

    console.log("semua status:", statuses);

    if (allWaiting) {
      newOrderStatus = "waiting";
    } else if (allDelivered) {
      newOrderStatus = "finished";
    } else {
      newOrderStatus = "ongoing";
    }
    console.log("order status:", newOrderStatus);

    // Update order_status pada tabel orders
    await sql`
      UPDATE orders
      SET order_status = ${newOrderStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;

    res.status(200).json({
      success: true,
      message: "Berhasil upload bukti foto.",
    });
  } catch (error) {
    console.error("Error in uploadBuktiFoto controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
