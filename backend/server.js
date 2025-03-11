import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import { sql } from "./config/db.js";

import authRoutes from "./routes/auth.route.js";
import serviceRoutes from "./routes/service.route.js";
import courierRoutes from "./routes/courier.route.js";
import customerRoutes from "./routes/customer.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json({ limit: "10mb" }));
app.use(helmet()); // helmet is a security middleware that helps you protect your app by setting various HTTP headers
app.use(morgan("dev")); // log the requests
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/couriers", courierRoutes);
app.use("/api/customers", customerRoutes);

async function initDB() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    await sql`
    CREATE TABLE IF NOT EXISTS services(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        image VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    await sql`
    CREATE TABLE IF NOT EXISTS couriers(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        availability_status VARCHAR(255) NOT NULL DEFAULT 'available',
        role VARCHAR(255) NOT NULL DEFAULT 'regular',
        status VARCHAR(255) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error init DB", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
  });
});
