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

interface RoleMapping {
  [key: string]: string;
}

const languageRoles: RoleMapping = {
  C: process.env.ROLE_C!,
  "C++": process.env.ROLE_CPP!,
  Rust: process.env.ROLE_RUST!,
  Zig: process.env.ROLE_ZIG!,
  Assembly: process.env.ROLE_ASSEMBLY!,
};

const skillRoles: RoleMapping = {
  Beginner: process.env.ROLE_BEGINNER!,
  Intermediate: process.env.ROLE_INTERMEDIATE!,
  Advanced: process.env.ROLE_ADVANCED!,
  Wizard: process.env.ROLE_WIZARD!,
};

const skillOrder: string[] = ["Beginner", "Intermediate", "Advanced", "Wizard"];

export function getLanguageRoleId(name: string): string | undefined {
  return languageRoles[name];
}

export function getSkillRoleId(level: string): string | undefined {
  return skillRoles[level];
}

export function computeHighestSkill(answers: Record<string, string>): string {
  let highest = 0;
  for (const lang of Object.keys(answers)) {
    const level = answers[lang];
    const idx = skillOrder.indexOf(level);
    if (idx > highest) highest = idx;
  }
  return skillOrder[highest];
}
