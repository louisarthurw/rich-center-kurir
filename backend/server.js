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
import orderRoutes from "./routes/order.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(helmet({ contentSecurityPolicy: false })); // helmet is a security middleware that helps you protect your app by setting various HTTP headers
app.use(morgan("dev")); // log the requests
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/couriers", courierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

async function initDB() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS auth(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        verification_token VARCHAR(10),
        expired_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
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
    await sql`
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        service_id INTEGER NOT NULL REFERENCES services(id),
        total_address INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        date DATE NOT NULL,
        pickup_name VARCHAR(255) NOT NULL,
        pickup_phone_number VARCHAR(255) NOT NULL,
        pickup_address VARCHAR(255) NOT NULL,
        pickup_notes VARCHAR(255),
        type VARCHAR(255) NOT NULL,
        weight NUMERIC(5,2) NOT NULL,
        take_package_on_behalf_of VARCHAR(255),
        lat NUMERIC(11,7),
        long NUMERIC(11,7),
        courier_id VARCHAR(255),
        visit_order VARCHAR(255),
        payment_status VARCHAR(255) NOT NULL DEFAULT 'waiting',
        order_status VARCHAR(255) NOT NULL DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await sql`
    CREATE TABLE IF NOT EXISTS order_details (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        delivery_name VARCHAR(255) NOT NULL,
        delivery_address VARCHAR(255) NOT NULL,
        delivery_phone_number VARCHAR(255) NOT NULL,
        delivery_notes VARCHAR(255),
        sender_name VARCHAR(255),
        lat NUMERIC(11,7),
        long NUMERIC(11,7),
        cluster_centroid VARCHAR(255),
        courier_id INTEGER REFERENCES couriers(id),
        visit_order INTEGER,
        proof_image VARCHAR(255),
        address_status VARCHAR(10) NOT NULL DEFAULT 'waiting',
        initial_coordinate VARCHAR(255),
        proof_coordinate VARCHAR(255),
        total_travel_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await sql`
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        courier_id INTEGER REFERENCES couriers(id),
        fcm_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
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
