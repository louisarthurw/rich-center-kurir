import { sql } from "../config/db.js";

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
      if (user[0].role !== "customer") {
        res
          .status(400)
          .json({ success: false, error: "User is not a customer" });
      } else {
        res.status(200).json({ success: true, data: user[0] });
      }
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.log("Error in getCustomerById controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
