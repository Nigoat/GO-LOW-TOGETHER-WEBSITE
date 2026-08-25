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

export default function Home() {
  return (
    <main className="text-center">
      <h1 className="text-4xl font-bold mb-4">Go Low Together</h1>
      <p className="text-gray-400 mb-8">Go low together.</p>
      <a
        href="#"
        className="bg-white hover:bg-gray-200 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Join our Discord
      </a>
    </main>
  );
}
