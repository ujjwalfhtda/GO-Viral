import { NextResponse } from "next/server";
import dns from "dns";
import { checkRateLimit, sanitizeString } from "../../../lib/security";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client-ip";

    if (!checkRateLimit(ip, 40, 60000)) {
      return NextResponse.json(
        { valid: false, reason: "Too many validation attempts. Please slow down.", step: "rate_limit" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = (body.email || "").trim().toLowerCase();
    const email = sanitizeString(rawEmail);

    // Step A: Syntax Regex Check
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({
        valid: false,
        reason: "Invalid email format. Must be user@example.com",
        step: "regex"
      });
    }

    // Step B: Extract Domain & DNS MX Lookup
    const domain = email.split("@")[1];
    if (!domain) {
      return NextResponse.json({
        valid: false,
        reason: "Missing domain name in email address",
        step: "regex"
      });
    }

    try {
      const mxRecords = await dns.promises.resolveMx(domain);

      if (!mxRecords || mxRecords.length === 0) {
        return NextResponse.json({
          valid: false,
          reason: `No active mail servers (MX records) found for domain @${domain}`,
          step: "dns_mx",
          domain
        });
      }

      // Sort MX records by priority (lower number = higher priority)
      const sortedMx = mxRecords
        .sort((a, b) => a.priority - b.priority)
        .map((r) => r.exchange);

      return NextResponse.json({
        valid: true,
        domain,
        mxServers: sortedMx
      });
    } catch (dnsErr) {
      return NextResponse.json({
        valid: false,
        reason: `Domain @${domain} does not exist or has no active mail servers`,
        step: "dns_mx",
        domain
      });
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, reason: "Server error validating email", step: "server" },
      { status: 500 }
    );
  }
}
