/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2026 Go Low Together
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

async function verifyTurnstile(token: string): Promise<boolean> {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
    }),
  });
  const data = await response.json();
  return data.success === true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, turnstileToken } = body;

    if (!token || !turnstileToken) {
      return NextResponse.json({ error: "Missing token or turnstile token" }, { status: 400 });
    }

    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json({ error: "Turnstile verification failed" }, { status: 403 });
    }

    const result = await sql`
      SELECT discord_user_id, guild_id FROM verify_tokens
      WHERE token = ${token} AND used = FALSE AND expires_at > NOW()
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    const { discord_user_id, guild_id } = result[0];

    await sql`UPDATE verify_tokens SET used = TRUE WHERE token = ${token}`;

    await sql`
      INSERT INTO pending_role_updates (discord_user_id, guild_id, role_id, action)
      VALUES (${discord_user_id}, ${guild_id}, ${process.env.VERIFIED_ROLE_ID!}, 'add')
    `;

    return NextResponse.json({
      success: true,
      discordUserId: discord_user_id,
      guildId: guild_id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
