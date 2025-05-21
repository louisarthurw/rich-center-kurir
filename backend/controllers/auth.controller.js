import { sql } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../nodemailer/email.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const generateLoginToken = (courierId) => {
  const loginToken = jwt.sign({ courierId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  const decoded = jwt.decode(loginToken);
  const expiresAt = decoded.exp * 1000;

  return {
    loginToken,
    expiresAt,
  };
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signup = async (req, res) => {
  const { name, email, password, phone_number } = req.body;

  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // check apakah user sudah terdafar
    const existingUser = await sql`
      SELECT * FROM users 
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

    // create verification token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Cek apakah sudah ada pending user di tabel auth
    const pendingUser = await sql`
      SELECT * FROM auth 
      WHERE email = ${email} OR phone_number = ${phone_number} 
      LIMIT 1
    `;

    let pendingUserResponse;

    if (pendingUser.length > 0) {
      // Update data pending user yang sudah ada dengan verification code baru dan perbarui expired_at
      pendingUserResponse = await sql`
        UPDATE auth
        SET 
          verification_token = ${verificationToken},
          expired_at = NOW() + INTERVAL '15 minutes',
          password = ${hashedPassword},
          name = ${name},
          phone_number = ${phone_number}
        WHERE id = ${pendingUser[0].id}
        RETURNING id, name, email, password, phone_number, verification_token, expired_at
      `;
    } else {
      // Insert pending user baru jika belum ada
      pendingUserResponse = await sql`
        INSERT INTO auth (name, email, password, phone_number, verification_token, expired_at)
        VALUES (${name}, ${email}, ${hashedPassword}, ${phone_number}, ${verificationToken}, NOW() + INTERVAL '15 minutes')
        RETURNING id, name, email, password, phone_number, verification_token, expired_at
      `;
    }

    // send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ success: true, data: pendingUserResponse[0] });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { name, email, password, phone_number, code } = req.body;

  try {
    // code verification
    const result = await sql`
      SELECT * FROM auth 
      WHERE email = ${email} AND verification_token = ${code} 
      AND expired_at > NOW()
      LIMIT 1
    `;
    console.log("result:", result);

    if (result.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    // create new user
    const newUser = await sql`
      INSERT INTO users (name, email, password, phone_number, role)
      VALUES (${name}, ${email}, ${password}, ${phone_number}, 'customer')
      RETURNING id, name, email, phone_number, role
    `;

    // update table auth set code = null
    await sql`
      UPDATE auth
      SET verification_token = NULL, expired_at = NULL
      WHERE email = ${email}
    `;

    // authenticate
    const { accessToken, refreshToken } = generateTokens(newUser[0].id);
    setCookies(res, accessToken, refreshToken);

    console.log("New user added:", newUser);
    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    console.log("Error in verifyEmail controller", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await sql`
      SELECT id, name, email, password, phone_number, role 
      FROM users WHERE email = ${email}
    `;

    if (user.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not registered" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const { accessToken, refreshToken } = generateTokens(user[0].id);

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      data: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        phone_number: user[0].phone_number,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginKurir = async (req, res) => {
  const { email, password, fcm_token } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email dan password harus diisi" });
  }

  try {
    const courier = await sql`
      SELECT *
      FROM couriers WHERE email = ${email}
    `;

    if (courier.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Akun tidak terdaftar" });
    }

    if (courier[0].status === "inactive") {
      return res.status(400).json({
        success: false,
        message: "Akun tidak aktif",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, courier[0].password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Password salah" });
    }

    const { loginToken, expiresAt } = generateLoginToken(courier[0].id);

    // simpan fcm token di db, untuk notifikasi
    await sql`
      INSERT INTO notifications (courier_id, fcm_token)
      VALUES (${courier[0].id}, ${fcm_token})
    `;

    res.status(200).json({
      success: true,
      data: courier[0],
      token: loginToken,
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.log("Error in loginKurir controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const deleteFCMToken = async (req, res) => {
  const { courier_id, fcm_token } = req.body;
  console.log(courier_id, fcm_token);

  try {
    await sql`
      DELETE FROM notifications
      WHERE courier_id = ${courier_id} AND fcm_token = ${fcm_token}
    `;

    res.status(200).json({ success: true, message: "Berhasil logout" });
  } catch (error) {
    console.log("Error in deleteFCMToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
