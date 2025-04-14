import { sql } from "../config/db.js";

export const getAllServices = async (req, res) => {
  try {
    const services = await sql`
        SELECT id, name, description, price, image, status, created_at, updated_at FROM services
        ORDER BY id ASC
      `;

    // console.log("fetched services", services);
    if (services.length > 0) {
      res.status(200).json({ success: true, data: services });
    } else {
      res
        .status(404)
        .json({ success: false, error: "No services found in database" });
    }
  } catch (error) {
    console.log("Error in getAllServices controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getAllActiveServices = async (req, res) => {
  try {
    const services = await sql`
        SELECT id, name, description, price, image, status, created_at, updated_at FROM services
        WHERE status = 'active'
        ORDER BY id ASC
      `;

    // console.log("fetched services", services);
    if (services.length > 0) {
      res.status(200).json({ success: true, data: services });
    } else {
      res
        .status(404)
        .json({ success: false, error: "No services found in database" });
    }
  } catch (error) {
    console.log("Error in getAllActiveServices controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await sql`
      SELECT id, name, description, price, image, status, created_at, updated_at FROM services WHERE id = ${id}
    `;

    if (service.length > 0) {
      res.status(200).json({ success: true, data: service[0] });
    } else {
      res.status(404).json({ success: false, error: "Service not found" });
    }
  } catch (error) {
    console.log("Error in getServiceById controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const createService = async (req, res) => {
  const { name, description, price, image } = req.body;

  if (!name || !description || !price || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // create new service
    const newService = await sql`
      INSERT INTO services (name, description, price, image, status)
      VALUES (${name}, ${description}, ${price}, ${image}, 'active')
      RETURNING *
    `;

    console.log("New service added:", newService);
    res.status(201).json({ success: true, data: newService[0] });
  } catch (error) {
    console.log("Error in createService controller", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, status  } = req.body;

  try {
    const updatedService = await sql`
      UPDATE services
      SET name = ${name}, description = ${description}, price = ${price}, image = ${image}, status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedService.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: updatedService[0] });
  } catch (error) {
    console.log("Error in updateService controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};