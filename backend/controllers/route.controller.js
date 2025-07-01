import axios from "../../frontend/src/lib/axios.js";
import { sql } from "../config/db.js";
import dotenv from "dotenv";
import { runGA } from "../utils/geneticAlgorithm.js";

dotenv.config();

export const generateRoute = async (req, res) => {
  const { courier_id, initial_location, data } = req.body;

  try {
    const coordinates = [];

    // initial location
    coordinates.push({
      type: "initial",
      id: "initial",
      lat: parseFloat(initial_location.split(",")[0]),
      long: parseFloat(initial_location.split(",")[1]),
    });

    // pickup location
    data.pickup_details.forEach((pickup) => {
      const courierIds = pickup.courier_id.split(",").map((id) => parseInt(id));
      if (courierIds.includes(courier_id)) {
        coordinates.push({
          type: "pickup",
          id: `pickup-${pickup.order_id}`,
          lat: parseFloat(pickup.lat),
          long: parseFloat(pickup.long),
          order_id: pickup.order_id,
        });
      }
    });

    // delivery location
    data.delivery_details.flat().forEach((delivery) => {
      if (delivery.courier_id === courier_id) {
        coordinates.push({
          type: "delivery",
          id: `delivery-${delivery.order_detail_id}`,
          lat: parseFloat(delivery.lat),
          long: parseFloat(delivery.long),
          order_id: delivery.order_id,
        });
      }
    });

    console.log("coordinates:", coordinates);

    const locations = coordinates.map((c) => `${c.lat},${c.long}`);

    const BATCH_LIMIT = 10;
    const total = locations.length;
    const timeMatrix = Array.from({ length: total }, () =>
      Array(total).fill(Infinity)
    );

    if (total <= BATCH_LIMIT) {
      // Kirim satu permintaan langsung jika jumlah alamat <= 10
      const all = locations.join("|");

      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/distancematrix/json",
        {
          params: {
            origins: all,
            destinations: all,
            key: process.env.GOOGLE_MAPS_API_KEY,
            mode: "driving",
            departure_time: "now",
          },
        }
      );

      response.data.rows.forEach((row, i) => {
        row.elements.forEach((el, j) => {
          if (el.status === "OK") {
            timeMatrix[i][j] = el.duration.value;
          }
        });
      });
    } else {
      // Kirim batch jika jumlah alamat > 10
      const fillMatrix = async () => {
        for (let i = 0; i < total; i += BATCH_LIMIT) {
          for (let j = 0; j < total; j += BATCH_LIMIT) {
            const originBatch = locations.slice(i, i + BATCH_LIMIT).join("|");
            const destinationBatch = locations
              .slice(j, j + BATCH_LIMIT)
              .join("|");

            const response = await axios.get(
              "https://maps.googleapis.com/maps/api/distancematrix/json",
              {
                params: {
                  origins: originBatch,
                  destinations: destinationBatch,
                  key: process.env.GOOGLE_MAPS_API_KEY,
                  mode: "driving",
                  departure_time: "now",
                },
              }
            );

            const rows = response.data.rows;

            rows.forEach((row, rowIndex) => {
              row.elements.forEach((el, colIndex) => {
                if (el.status === "OK") {
                  timeMatrix[i + rowIndex][j + colIndex] = el.duration.value;
                }
              });
            });
          }
        }
      };

      await fillMatrix();
    }

    console.log("time matrix:", timeMatrix);
    console.log("coordinates:", coordinates);

    const { bestRoute, bestTime } = runGA(timeMatrix, coordinates);

    console.log("best route:", bestRoute);
    console.log("best time:", bestTime);

    for (let i = 0; i < bestRoute.length; i++) {
      const index = bestRoute[i];
      const point = coordinates[index];

      if (point.type === "delivery" && i > 0) {
        const visitOrder = i;
        const deliveryId = parseInt(point.id.replace("delivery-", ""));

        // update tabel order_details
        await sql`
          UPDATE order_details
          SET visit_order = ${visitOrder},
              initial_coordinate = ${initial_location},
              total_travel_time = ${bestTime}
          WHERE id = ${deliveryId}
        `;
      }
    }

    const orderVisitMap = new Map();

    for (let i = 0; i < bestRoute.length; i++) {
      const index = bestRoute[i];
      const point = coordinates[index];

      if (point.type === "pickup") {
        const orderId = point.order_id;

        // ambil courier_id tabel orders
        const result = await sql`
          SELECT courier_id, visit_order FROM orders WHERE id = ${orderId}
        `;
        console.log("resss:", result);

        const courierStr = result[0]?.courier_id;
        const visitStr = result[0]?.visit_order;

        const courierList = courierStr.split(",").map((id) => parseInt(id));

        let visitArr;

        // tentukan urutan untuk array visit_order
        if (visitStr && visitStr !== "") {
          visitArr = visitStr.split(",").map((val) => parseInt(val));
        } else {
          visitArr = new Array(courierList.length).fill(0);
        }

        const indexInCourierList = courierList.indexOf(courier_id);
        if (indexInCourierList !== -1) {
          // posisi kunjungan kurir ke lokasi pickup ini
          visitArr[indexInCourierList] = i;
        }

        orderVisitMap.set(orderId, {
          visit_order: visitArr.join(","),
        });
      }
    }

    console.log("order visit map:", orderVisitMap);

    for (const [orderId, data] of orderVisitMap.entries()) {
      await sql`
        UPDATE orders
        SET visit_order = ${data.visit_order}
        WHERE id = ${orderId}
      `;
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan rute.",
    });
  } catch (error) {
    console.log("Error in generateRoute controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
