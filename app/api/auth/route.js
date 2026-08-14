import { NextResponse } from "next/server";
import { getUserDB, saveUserDB, getUserByEmailDB } from "../../../lib/db";
import { checkRateLimit, sanitizeString } from "../../../lib/security";

export async function GET(request) {
  try {
    const user = getUserDB();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch user session" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client-ip";

    if (!checkRateLimit(ip, 20, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many authentication attempts" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const action = body.action || "login";

    if (action === "logout") {
      saveUserDB(null);
      return NextResponse.json({ success: true, user: null });
    }

    if (action === "update_favorites") {
      const activeUser = getUserDB();
      if (activeUser) {
        activeUser.favorites = Array.isArray(body.favorites) ? body.favorites : [];
        activeUser.updatedAt = Date.now();
        saveUserDB(activeUser);
        return NextResponse.json({ success: true, user: activeUser });
      }
      return NextResponse.json({ success: true });
    }

    const email = sanitizeString(body.email || "").toLowerCase().trim();
    const password = (body.password || "").trim();
    const name = sanitizeString(body.name || "").trim();
    const avatar = (body.avatar || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 4 characters long" },
        { status: 400 }
      );
    }

    // Lookup user in database registry
    const existingUser = getUserByEmailDB(email);

    // SIGN IN FLOW
    if (action === "login") {
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: "No account found with this email. Please create a new account."
          },
          { status: 404 }
        );
      }

      // Check Password
      if (email === "ujjwal@gmail.com") {
        if (password !== "ujjwal7077") {
          return NextResponse.json(
            { success: false, error: "Incorrect password for admin user ujjwal@gmail.com" },
            { status: 401 }
          );
        }
      } else {
        if (existingUser.password && existingUser.password !== password) {
          return NextResponse.json(
            { success: false, error: "Incorrect password! Please enter the exact password you set when creating your account." },
            { status: 401 }
          );
        }
        if (!existingUser.password) {
          existingUser.password = password;
        }
      }

      const activeUser = {
        ...existingUser,
        isLoggedIn: true,
        avatar: avatar || existingUser.avatar || "",
        updatedAt: Date.now()
      };
      saveUserDB(activeUser);
      return NextResponse.json({ success: true, user: activeUser });
    }

    // SIGN UP / CREATE ACCOUNT FLOW
    if (action === "signup") {
      if (existingUser && email !== "ujjwal@gmail.com") {
        return NextResponse.json(
          {
            success: false,
            alreadyExists: true,
            error: "An account with this email already exists. Please sign in instead."
          },
          { status: 400 }
        );
      }

      const newUserProfile = {
        id: email === "ujjwal@gmail.com" ? "u_admin_ujjwal" : "u_" + Date.now(),
        name: name || email.split("@")[0],
        email,
        password,
        avatar: avatar || (existingUser?.avatar || ""),
        favorites: existingUser?.favorites || [],
        isLoggedIn: true,
        isAdmin: email === "ujjwal@gmail.com",
        role: email === "ujjwal@gmail.com" ? "Admin & Creator" : "Member Creator",
        updatedAt: Date.now()
      };

      saveUserDB(newUserProfile);
      return NextResponse.json({ success: true, user: newUserProfile });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
