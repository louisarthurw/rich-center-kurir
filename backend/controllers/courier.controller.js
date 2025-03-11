import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

export const getAllCouriers = async (req, res) => {
  try {
    const couriers = await sql`
        SELECT id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at FROM couriers
        ORDER BY id DESC
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
    res.status(201).json({ success: true, data: newCourier[0] });
  } catch (error) {
    console.log("Error in addCourier controller", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const updateCourier = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    password,
    phone_number,
    address,
    availability_status,
    role,
    status,
  } = req.body;

  try {
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedCourier = await sql`
      UPDATE couriers
      SET name = ${name}, email = ${email}, password = ${hashedPassword}, phone_number = ${phone_number}, address = ${address}, availability_status = ${availability_status}, role = ${role}, status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, password, phone_number, address, availability_status, role, status, created_at, updated_at
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
