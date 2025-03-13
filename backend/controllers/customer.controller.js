import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

export const getAllCustomers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name, email, phone_number, role, created_at, updated_at FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `;

    console.log("fetched users", users);
    if (users.length > 0) {
      res.status(200).json({ success: true, data: users });
    } else {
      res
        .status(404)
        .json({ success: false, error: "No customer found in database" });
    }
  } catch (error) {
    console.log("Error in getAllCustomers controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await sql`
      SELECT id, name, email, phone_number, role, created_at, updated_at FROM users WHERE id = ${id}
    `;

    if (user.length > 0) {
      res.status(200).json({ success: true, data: user[0] });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.log("Error in getCustomerById controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const { id } = req.params;
  console.log(id)

  const { password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedPassword = await sql`
      UPDATE users
      SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone_number, role, created_at, updated_at
    `;

    console.log(updatedPassword)

    if (updatedPassword.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    res.status(200).json({ success: true, message: "Password changed, please login again." });
  } catch (error) {
    console.log("Error in changePassword controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;

  const { name, email, phone_number } = req.body;

  try {
    // Cek apakah user dengan email/phone_number yang baru sudah ada di database
    const existingUser = await sql`
      SELECT id, email, phone_number FROM users 
      WHERE (email = ${email} OR phone_number = ${phone_number}) AND id != ${id}
    `;

    // Jika ada user lain yang memiliki email/phone_number yang sama, tolak update
    if (existingUser.length > 0) {
      if (existingUser.some((user) => user.email === email)) {
        return res
          .status(400)
          .json({ message: "Email is already registered by another user" });
      }
      if (existingUser.some((user) => user.phone_number === phone_number)) {
        return res
          .status(400)
          .json({
            message: "Phone number is already registered by another user",
          });
      }
    }

    const updatedCustomer = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, phone_number = ${phone_number}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone_number, role, created_at, updated_at
    `;

    if (updatedCustomer.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, data: updatedCustomer[0] });
  } catch (error) {
    console.log("Error in updateCustomer controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
