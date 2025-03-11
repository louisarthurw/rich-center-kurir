import { sql } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name, email, phone_number, role, created_at, updated_at FROM users
      ORDER BY created_at DESC
    `;

    console.log("fetched users", users);
    if (users.length > 0) {
      res.status(200).json({ success: true, data: users });
    } else {
      res
        .status(404)
        .json({ success: false, error: "No user found in database" });
    }
  } catch (error) {
    console.log("Error in getAllUsers controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
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
    console.log("Error in getUserById controller", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  const { name, email, password, phone_number } = req.body;

  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // check if user exists
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

    // create new user
    const newUser = await sql`
      INSERT INTO users (name, email, password, phone_number, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phone_number}, 'customer')
      RETURNING id, name, email, phone_number, role
    `;

    // authenticate
    const { accessToken, refreshToken } = generateTokens(newUser[0].id);

    setCookies(res, accessToken, refreshToken);

    console.log("New user added:", newUser);
    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    console.log("Error in signup controller", error.message);
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
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const { accessToken, refreshToken } = generateTokens(user[0].id);

    setCookies(res, accessToken, refreshToken);

    res
      .status(200)
      .json({
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

// // this will refresh the access token
// export const refreshToken = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;

//     if (!refreshToken) {
//       return res.status(401).json({ message: "No refresh token provided" });
//     }

//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

//     if (storedToken !== refreshToken) {
//       return res.status(401).json({ message: "Invalid refresh token" });
//     }

//     const accessToken = jwt.sign(
//       { userId: decoded.userId },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "15m" }
//     );

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.json({ message: "Token refreshed successfully" });
//   } catch (error) {
//     console.log("Error in refreshToken controller", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
