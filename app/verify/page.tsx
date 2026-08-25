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

import { sql } from "@/lib/db";
import VerifyFlow from "./VerifyFlow";

interface TokenRow {
  discord_user_id: string;
  guild_id: string;
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <main className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Invalid Link</h1>
        <p className="text-gray-400">No verification token provided.</p>
      </main>
    );
  }

  const result = await sql`
    SELECT discord_user_id, guild_id FROM verify_tokens
    WHERE token = ${token} AND used = FALSE AND expires_at > NOW()
  ` as TokenRow[];

  if (result.length === 0) {
    return (
      <main className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Token Expired or Used</h1>
        <p className="text-gray-400">Please go back to Discord and click Verify again.</p>
      </main>
    );
  }

  return (
    <main className="w-full max-w-md mx-auto px-4">
      <VerifyFlow
        token={token}
        discordUserId={result[0].discord_user_id}
        guildId={result[0].guild_id}
      />
    </main>
  );
}
