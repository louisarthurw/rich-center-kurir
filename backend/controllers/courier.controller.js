import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

export const getAllCouriers = async (req, res) => {
  try {
    const couriers = await sql`
        SELECT id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at FROM couriers
        ORDER BY id ASC
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

    console.log("fetched couriers", couriers);
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
        return res
          .status(400)
          .json({
            message: "Phone number is already registered by another courier",
          });
      }
    }

    const updatedCourier = await sql`
      UPDATE couriers
      SET name = ${name}, email = ${email}, phone_number = ${phone_number}, address = ${address}, role = ${role}, status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone_number, address, role, status, created_at, updated_at
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
