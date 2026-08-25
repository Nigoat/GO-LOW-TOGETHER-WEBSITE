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
import { getLanguageRoleId, getSkillRoleId, computeHighestSkill } from "@/lib/role-mapping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { discordUserId, guildId, languages, skillAnswers } = body;

    if (!discordUserId || !guildId || !languages || !skillAnswers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    for (const lang of languages) {
      const roleId = getLanguageRoleId(lang);
      if (roleId) {
        await sql`
          INSERT INTO pending_role_updates (discord_user_id, guild_id, role_id, action)
          VALUES (${discordUserId}, ${guildId}, ${roleId}, 'add')
        `;
        await sql`
          INSERT INTO user_roles (discord_user_id, role_id, role_type)
          VALUES (${discordUserId}, ${roleId}, 'language')
        `;
      }
    }

    const highestSkill = computeHighestSkill(skillAnswers);
    const skillRoleId = getSkillRoleId(highestSkill);
    if (skillRoleId) {
      await sql`
        INSERT INTO pending_role_updates (discord_user_id, guild_id, role_id, action)
        VALUES (${discordUserId}, ${guildId}, ${skillRoleId}, 'add')
      `;
      await sql`
        INSERT INTO user_roles (discord_user_id, role_id, role_type)
        VALUES (${discordUserId}, ${skillRoleId}, 'skill')
      `;
    }

    return NextResponse.json({ success: true, highestSkill });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
