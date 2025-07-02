import { sql } from "../config/db.js";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendFcmNotification } from "../config/fcm.js";
import axios from "../../frontend/src/lib/axios.js";

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

    // console.log("fetched orders", orders);
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
        od.order_id,
        od.delivery_name,
        od.delivery_address,
        od.delivery_phone_number,
        od.delivery_notes,
        od.sender_name,
        od.lat,
        od.long,
        od.courier_id,
        c.name AS courier_name,
        od.visit_order,
        od.proof_image,
        od.address_status,
        od.proof_coordinate
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

    // Validasi alamat yang dipilih
    if (pickupDetails.pickup_lat == null || pickupDetails.pickup_lng == null) {
      return res.status(400).json({
        success: false,
        error:
          "Alamat pengambilan barang harus dipilih dari suggestion yang diberikan!",
      });
    }

    for (let i = 0; i < deliveryDetails.length; i++) {
      const detail = deliveryDetails[i];
      if (detail.delivery_lat == null || detail.delivery_lng == null) {
        return res.status(400).json({
          success: false,
          error: `Alamat pengiriman #${
            i + 1
          } harus dipilih dari suggestion yang diberikan!`,
        });
      }
    }

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

    // cek apakah order nya diassign ke kurir mobil atau kurir khusus
    let assignedCourierId = null;

    // service id 2 = kurir flat mobil, kurir mobil mempunyai id 6, jadi saat order ini dibuat, langsung diassgin ke kurir mobil
    if (Number(service_id) === 2) {
      assignedCourierId = 6;
    }

    // service id 4 = kurir same day motor, jadi saat order ini dibuat, langsung di assign ke kurir khusus
    if (Number(service_id) === 4) {
      const specialCourier = await sql`
        SELECT id FROM couriers 
        WHERE role = 'special' AND status = 'active' 
        ORDER BY id ASC
        LIMIT 1
      `;

      if (specialCourier.length > 0) {
        assignedCourierId = specialCourier[0].id;
      } else {
        return res.status(400).json({
          success: false,
          error: "Tidak ada kurir khusus yang aktif tersedia.",
        });
      }
    }

    // Insert ke tabel orders
    const newOrder = await sql`
      INSERT INTO orders (
        user_id, service_id, total_address, subtotal, date, pickup_name,
        pickup_phone_number, pickup_address, pickup_notes, type, length, width, height,
        take_package_on_behalf_of, lat, long, courier_id, visit_order,
      payment_status, order_status
      ) VALUES (
        ${user_id}, ${service_id}, ${total_address}, ${subtotal}, ${
      pickupDetails.date
    },
        ${pickupDetails.pickup_name}, ${pickupDetails.pickup_phone_number}, ${
      pickupDetails.pickup_address
    },
        ${pickupDetails.pickup_notes}, ${pickupDetails.type}, ${
      pickupDetails.length
    }, ${pickupDetails.width}, ${pickupDetails.height},
        ${pickupDetails.take_package_on_behalf_of}, ${
      pickupDetails.pickup_lat
    }, ${
      pickupDetails.pickup_lng
    }, ${assignedCourierId}, ${null}, 'waiting', 'waiting'
      ) RETURNING *;
    `;

    const orderId = newOrder[0].id;

    // Insert ke tabel order_details
    const orderDetailsQueries = deliveryDetails.map((detail) => {
      return sql`
        INSERT INTO order_details (
          order_id, delivery_name, delivery_address, delivery_phone_number, delivery_notes, 
          sender_name, lat, long, cluster_centroid, courier_id, visit_order, proof_image, address_status
        ) VALUES (
          ${orderId}, ${detail.delivery_name}, ${detail.delivery_address}, ${
        detail.delivery_phone_number
      }, 
          ${detail.delivery_notes},${detail.sender_name}, ${
        detail.delivery_lat
      }, ${
        detail.delivery_lng
      }, ${null}, ${assignedCourierId}, ${null}, ${null}, 'waiting'
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
      return res
        .status(403)
        .json({ success: false, error: "Invalid signature key" });
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
        UPDATE orders
        SET order_status = 'cancelled'
        WHERE id = ${order_id}
      `;
      await sql`
        UPDATE order_details
        SET address_status = 'cancelled'
        WHERE order_id = ${order_id}
      `;
    }

    // Kirim notifikasi
    if (paymentStatus === "paid") {
      const { service_id, courier_id } = order[0];

      if (service_id === 2 || service_id === 4) {
        if (courier_id) {
          const courierIds = courier_id
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));

          const notifications = await sql`
            SELECT courier_id, fcm_token FROM notifications
            WHERE courier_id = ANY(${courierIds})
          `;

          for (const notif of notifications) {
            if (notif.fcm_token) {
              await sendFcmNotification(
                notif.fcm_token,
                "Ada order masuk",
                "Anda mendapatkan tugas baru!"
              );
            }
          }
        }
      }
    }

    res.status(200).json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.error("Error in Midtrans webhook:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const assignKurirManual = async (req, res) => {
  const { delivery_details } = req.body;
  // console.log("delivery details: ", delivery_details);

  try {
    const invalidEntries = delivery_details.filter(
      (detail) => detail.courier_id === null || detail.courier_id === undefined
    );

    if (invalidEntries.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Ada alamat yang belum di assignkan kurirnya.",
      });
    }

    for (const detail of delivery_details) {
      const { id, courier_id } = detail;

      await sql`
          UPDATE order_details
          SET courier_id = ${courier_id}
          WHERE id = ${id}
        `;
    }

    const orderId = delivery_details[0]?.order_id;
    // console.log("order id:", orderId);

    const courierIdsResult = await sql`
      SELECT DISTINCT courier_id
      FROM order_details
      WHERE order_id = ${orderId}
    `;
    // console.log("result:", courierIdsResult);

    const courierIds = courierIdsResult.map((row) => row.courier_id);
    // console.log("courier id:", courierIds);
    const courierIdsString = courierIds.sort((a, b) => a - b).join(",");
    // console.log("sorted courier id:", courierIdsString);

    await sql`
      UPDATE orders
      SET courier_id = ${courierIdsString}
      WHERE id = ${orderId}
    `;

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

async function getDistance(p1, p2) {
  // console.log("origin: ", p1, ", destination: ", p2);
  if (p1[0] === p2[0] && p1[1] === p2[1]) {
    return 0;
  }

  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;
  const origin = `${lat1},${lng1}`;
  const destination = `${lat2},${lng2}`;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === "OK") {
      const distance = data.routes[0].legs[0].distance.value;
      // console.log("distance: ", distance / 1000);
      return distance / 1000;
    }
  } catch (error) {
    console.error(
      `Error calculating distance (${origin} to ${destination}):`,
      error.message
    );
  }
}

export async function calculateSilhouetteScore(vectors, labels, distanceFn) {
  const n = vectors.length;
  const clusterMap = new Map();

  for (let i = 0; i < n; i++) {
    const label = labels[i];
    if (!clusterMap.has(label)) {
      clusterMap.set(label, []);
    }
    clusterMap.get(label).push(i);
  }

  const silhouetteScores = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const ownCluster = labels[i];
    const ownIndices = clusterMap.get(ownCluster).filter((idx) => idx !== i);

    // a(i) = rata-rata jarak antar titik i dengan titik lainnya dalam cluster yang sama
    let a = 0;
    if (ownIndices.length > 0) {
      const aSumPromises = ownIndices.map((j) =>
        distanceFn(vectors[i], vectors[j])
      );
      const aDistances = await Promise.all(aSumPromises);
      a = aDistances.reduce((sum, val) => sum + val, 0) / aDistances.length;
    }

    // b(i) = rata-rata jarak antar titik i dengan titik lainnya dalam cluster lain yang paling dekat
    let b = Infinity;
    for (const [label, indices] of clusterMap.entries()) {
      if (label === ownCluster) continue;
      const bSumPromises = indices.map((j) =>
        distanceFn(vectors[i], vectors[j])
      );
      const bDistances = await Promise.all(bSumPromises);
      const bAvg =
        bDistances.reduce((sum, val) => sum + val, 0) / bDistances.length;
      if (bAvg < b) {
        b = bAvg;
      }
    }

    // silhouette score s(i) = (b(i)-a(i)) / max(a(i),b(i))
    const s = a === 0 && b === 0 ? 0 : (b - a) / Math.max(a, b);
    silhouetteScores[i] = s;
  }

  // Rata-rata keseluruhan
  const totalAvg = silhouetteScores.reduce((sum, s) => sum + s, 0) / n;

  return { silhouetteScores, totalAvg };
}

async function KMeansClustering(
  locations,
  k,
  distanceFn,
  maxIterations = 1000
) {
  const n = locations.length;
  const maxPerCluster = Math.ceil(n / k);

  // Inisialisasi K-Means++
  let centroids = [];

  // Pilih centroid pertama secara acak dari locations
  centroids.push(locations[Math.floor(Math.random() * n)]);

  // Hitung jarak minimum titik ke centroid yang sudah terpilih
  async function getMinDistToCentroids(point, centroids) {
    let minDist = Infinity;
    for (const centroid of centroids) {
      const dist = await distanceFn(point, centroid);
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  }

  // Pilih centroid berikutnya sampai k centroid terpilih
  while (centroids.length < k) {
    // Hitung jarak minimum kuadrat tiap titik ke centroid terdekat
    const distances = await Promise.all(
      locations.map((loc) => getMinDistToCentroids(loc, centroids))
    );

    // Pemilihan berdasarkan jarak kuadrat agar titik jauh lebih mungkin dipilih
    const distancesSquared = distances.map((d) => d * d);

    // Hitung total jarak kuadrat dan probabilitas tiap titik
    const sumDistancesSquared = distancesSquared.reduce((a, b) => a + b, 0);
    const probabilities = distancesSquared.map((d) => d / sumDistancesSquared);

    const cumulativeProbs = [];
    probabilities.reduce((acc, curr, i) => {
      cumulativeProbs[i] = acc + curr;
      return cumulativeProbs[i];
    }, 0);

    // Pilih titik baru berdasarkan probabilitas
    const r = Math.random();
    let nextCentroidIndex = cumulativeProbs.findIndex((p) => r < p);
    if (nextCentroidIndex === -1) nextCentroidIndex = n - 1;

    centroids.push(locations[nextCentroidIndex]);
  }

  let assignments = new Array(n).fill(-1);

  for (let iter = 0; iter < maxIterations; iter++) {
    let hasChanged = false;

    // Simpan jumlah alamat yang ada dalam cluster
    const clusterCounts = Array(k).fill(0);
    const newAssignments = new Array(n).fill(-1);

    for (let i = 0; i < n; i++) {
      let bestCluster = -1;
      let minDist = Infinity;

      for (let c = 0; c < k; c++) {
        // Skip memasukkan titik jika cluster sudah penuh
        if (clusterCounts[c] >= maxPerCluster) continue;

        const dist = await distanceFn(locations[i], centroids[c]);
        // Menentukan cluster terdekat yang masih punya slot
        if (dist < minDist) {
          minDist = dist;
          bestCluster = c;
        }
      }

      // Tambahkan titik ke dalam cluster terdekat tersebut
      if (bestCluster !== -1) {
        newAssignments[i] = bestCluster;
        clusterCounts[bestCluster]++;
      } else {
        throw new Error(`Tidak ada cluster tersedia untuk lokasi index ${i}`);
      }
    }

    // Cek apakah ada perubahan assignment
    // assignments --> array yang menyimpan cluster mana lokasi i ditugaskan pada iterasi sebelumnya.
    // newAssignments --> array yang menyimpan cluster mana lokasi i ditugaskan pada iterasi saat ini.
    for (let i = 0; i < n; i++) {
      if (assignments[i] !== newAssignments[i]) {
        hasChanged = true;
        break;
      }
    }

    assignments = newAssignments;

    // Jika tidak ada perubahan, maka looping berhenti karena sudah optimal
    if (!hasChanged) break;

    // Update centroid dari rata-rata lokasi dalam cluster
    const newCentroids = Array(k)
      .fill()
      .map(() => [0, 0]);
    const counts = Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      // newCentroids[c] menyimpan penjumlahan koordinat semua titik dalam cluster c
      // counts[c] menghitung berapa banyak titik yang ada di cluster c
      const c = assignments[i];
      newCentroids[c][0] += locations[i][0];
      newCentroids[c][1] += locations[i][1];
      counts[c]++;
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) {
        // Jika cluster kosong, pindahkan centroid ke lokasi acak
        newCentroids[c] = locations[Math.floor(Math.random() * n)];
      } else {
        // Hitung rata-rata titik-titik dalam cluster (centroid baru)
        newCentroids[c][0] /= counts[c];
        newCentroids[c][1] /= counts[c];
      }
    }

    centroids = newCentroids;
  }

  return { idxs: assignments, centroids };
}

export const assignKurir = async (req, res) => {
  const { date } = req.body;

  try {
    // Ambil kurir regular yang available
    const available_regular_couriers = await sql`
        SELECT id, name, email, phone_number, address, availability_status, role, status, created_at, updated_at 
        FROM couriers
        WHERE availability_status = 'available' 
          AND role = 'regular' 
          AND status = 'active'
        ORDER BY id ASC
      `;
    // console.log(available_regular_couriers)

    if (available_regular_couriers.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No available regular couriers found in database",
      });
    }

    // Ambil semua alamat pengiriman kurir flat motor
    const order_details = await sql`
        SELECT od.id, od.order_id, od.lat, od.long, od.delivery_name
        FROM order_details od
        INNER JOIN orders o ON od.order_id = o.id
        WHERE DATE(o.date) = ${date}
          AND o.service_id = 1
          AND od.address_status = 'waiting'
          AND o.payment_status = 'paid'
      `;
    // console.log(order_details);

    // Mengubah data lat dan long menjadi vektor
    const vectors = order_details.map((order) => [
      parseFloat(order.lat),
      parseFloat(order.long),
    ]);
    console.log("vectors: ", vectors);

    // handle jika k > alamat pengiriman
    if (vectors.length < available_regular_couriers.length) {
      console.log(
        `Jumlah alamat (${vectors.length}) lebih sedikit dari jumlah kurir (${available_regular_couriers.length}). Melakukan distribusi manual secara acak.`
      );

      // Acak daftar kurir, lalu ambil sebanyak jumlah alamat
      const shuffledCouriers = [...available_regular_couriers].sort(
        () => 0.5 - Math.random()
      );
      const selectedCouriers = shuffledCouriers.slice(0, vectors.length);

      const courierAssignments = {};

      for (let i = 0; i < vectors.length; i++) {
        const courier = selectedCouriers[i];
        const courierId = courier.id;
        const orderDetail = order_details[i];

        const centroidStr = `${orderDetail.lat},${orderDetail.long}`;

        await sql`
          UPDATE order_details
          SET courier_id = ${courierId}, cluster_centroid = ${centroidStr}
          WHERE id = ${orderDetail.id}
        `;

        const orderId = orderDetail.order_id;
        if (!courierAssignments[orderId]) {
          courierAssignments[orderId] = new Set();
        }
        courierAssignments[orderId].add(courierId);

        console.log(
          `Assigned Courier #${courierId} to OrderDetail ID: ${orderDetail.id}`
        );
      }

      // Update orders.courier_id
      for (const orderId in courierAssignments) {
        const courierIds = Array.from(courierAssignments[orderId])
          .sort((a, b) => a - b)
          .join(",");
        await sql`
          UPDATE orders
          SET courier_id = ${courierIds}
          WHERE id = ${orderId}
        `;
        console.log(
          `Updated courier_id for Order ID: ${orderId} with couriers: ${courierIds}`
        );
      }

      // Kirim notifikasi ke semua courier
      const courierIdList = Object.values(courierAssignments)
        .flatMap((set) => Array.from(set))
        .filter((v, i, self) => self.indexOf(v) === i); // unique

      if (courierIdList.length > 0) {
        const tokensResult = await sql`
          SELECT courier_id, fcm_token
          FROM notifications
          WHERE courier_id = ANY(${courierIdList})
        `;

        for (const { courier_id, fcm_token } of tokensResult) {
          try {
            await sendFcmNotification(
              fcm_token,
              "Ada order masuk",
              "Anda mendapatkan tugas baru!"
            );
            console.log(
              `Notifikasi berhasil dikirim ke Courier ID ${courier_id}`
            );
          } catch (err) {
            console.error(
              `Gagal kirim notifikasi ke Courier ID ${courier_id}`,
              err
            );
          }
        }
      }

      return res.status(200).json({
        success: true,
        message:
          "Jumlah alamat lebih sedikit dari jumlah kurir. Distribusi manual acak berhasil.",
      });
    }

    // Apply kmeans untuk clustering
    const result = await KMeansClustering(
      vectors,
      available_regular_couriers.length,
      getDistance
    );
    console.log("result: ", result);

    // Hitung silhouette score
    const { silhouetteScores, totalAvg } = await calculateSilhouetteScore(
      vectors,
      result.idxs,
      getDistance
    );

    // Objek untuk melacak kurir yang ditugaskan ke setiap order_id
    const courierAssignments = {};

    // Assign orders ke kurir
    for (const [i, courier] of available_regular_couriers.entries()) {
      const courierId = courier.id;
      const clusterIndices = result.idxs
        .map((idx, index) => (idx === i ? index : -1))
        .filter((idx) => idx !== -1);

      // Assign courier ke order_details
      for (const index of clusterIndices) {
        try {
          const centroid = result.centroids[i];
          const centroidStr = `${centroid[0]},${centroid[1]}`;

          await sql`
            UPDATE order_details
            SET courier_id = ${courierId}, cluster_centroid = ${centroidStr}
            WHERE id = ${order_details[index].id}
          `;
          // console.log(
          //   `Assigned Courier #${courierId} to OrderDetail ID: ${order_details[index].id}`
          // );
          // console.log(
          //   `Silhouette score OrderDetailID ${
          //     order_details[index].id
          //   }: ${silhouetteScores[index].toFixed(4)}\n`
          // );

          // Tambahkan courierId ke daftar yang akan diupdate di orders
          const orderId = order_details[index].order_id;
          if (!courierAssignments[orderId]) {
            courierAssignments[orderId] = new Set();
          }
          courierAssignments[orderId].add(courierId);
        } catch (updateError) {
          console.log(
            `Failed to update Courier for OrderDetail ID: ${order_details[index].id}`,
            updateError
          );
        }
      }
    }

    // print hasil clustering
    console.log("===== HASIL CLUSTERING =====");
    for (const [i, courier] of available_regular_couriers.entries()) {
      const courierId = courier.id;

      // Cari index order_details yang masuk ke cluster i
      const clusterIndices = result.idxs
        .map((clusterIdx, idx) => (clusterIdx === i ? idx : -1))
        .filter((idx) => idx !== -1);

      const detailList = [];
      const scoreList = [];

      for (const idx of clusterIndices) {
        const detail = order_details[idx];
        const placeName = detail.delivery_name || "-";
        const score = silhouetteScores[idx];

        detailList.push(`OrderDetailID ${detail.id} (${placeName})`);
        scoreList.push(score.toFixed(4));
      }

      console.log(
        `Cluster ${i + 1} (Courier ID #${courierId}) = ${detailList.join(", ")}`
      );
      console.log(`Silhouette Score = ${scoreList.join(", ")}\n`);
    }

    console.log(
      `Silhouette Score rata-rata keseluruhan: ${totalAvg.toFixed(4)}\n`
    );

    // Setelah menugaskan kurir ke semua order_details, update courier_id di orders
    for (const orderId in courierAssignments) {
      const courierIds = Array.from(courierAssignments[orderId]).join(",");
      await sql`
        UPDATE orders
        SET courier_id = ${courierIds}
        WHERE id = ${orderId}
      `;
      console.log(
        `Updated courier_id for Order ID: ${orderId} with couriers: ${courierIds}`
      );
    }

    // Assign untuk service kurir request jam ke kurir khusus
    // Ambil kurir khusus di hari ini
    const specialCourier = await sql`
      SELECT id FROM couriers
      WHERE role = 'special' AND status = 'active'
      ORDER BY id ASC
      LIMIT 1
    `;

    if (specialCourier.length > 0) {
      const courierId = specialCourier[0].id;

      const requestJamDetails = await sql`
        SELECT od.id, od.order_id
        FROM order_details od
        INNER JOIN orders o ON od.order_id = o.id
        WHERE DATE(o.date) = ${date}
          AND o.service_id = 3
          AND o.payment_status = 'paid'
          AND od.address_status = 'waiting'
      `;

      for (const od of requestJamDetails) {
        await sql`
          UPDATE order_details
          SET courier_id = ${courierId}
          WHERE id = ${od.id}
        `;

        if (!courierAssignments[od.order_id]) {
          courierAssignments[od.order_id] = new Set();
        }
        courierAssignments[od.order_id].add(courierId);

        console.log(
          `Assigned Special Courier #${courierId} to OrderDetail ID: ${od.id}`
        );
      }

      const updatedOrderIds = [
        ...new Set(requestJamDetails.map((od) => od.order_id)),
      ];

      for (const orderId of updatedOrderIds) {
        await sql`
          UPDATE orders
          SET courier_id = ${courierId.toString()}
          WHERE id = ${orderId}
        `;
        console.log(
          `Updated courier_id for Order ID: ${orderId} with courier: ${courierId}`
        );
      }
    }

    // Kirim notifikasi ke semua device dari kurir yang diassign
    const allAssignedCourierIds = new Set();

    for (const courierSet of Object.values(courierAssignments)) {
      courierSet.forEach((id) => allAssignedCourierIds.add(id));
    }

    const courierIdList = Array.from(allAssignedCourierIds);

    if (courierIdList.length > 0) {
      // Ambil semua fcm_token berdasarkan courier_id yang diassign
      const tokensResult = await sql`
          SELECT courier_id, fcm_token
          FROM notifications
          WHERE courier_id = ANY(${courierIdList})
        `;

      for (const { courier_id, fcm_token } of tokensResult) {
        try {
          await sendFcmNotification(
            fcm_token,
            "Ada order masuk",
            "Anda mendapatkan tugas baru!"
          );

          console.log(
            `Notifikasi berhasil dikirim ke Courier ID ${courier_id}`
          );
        } catch (err) {
          console.error(
            `Gagal kirim notifikasi ke Courier ID ${courier_id}`,
            err
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Courier assignment completed and database updated successfully.",
      clusteringResult: result,
    });
  } catch (error) {
    console.log("Error in assignKurir controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
