import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Creates the first admin account if no users exist yet
export async function seedAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.warn('ADMIN_USERNAME or ADMIN_PASSWORD not set. Skipping admin creation.');
    return;
  }
  if (await User.exists({})) return;

  await User.create({
    username: ADMIN_USERNAME.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
  });
  console.log(`Admin user "${ADMIN_USERNAME}" created`);
}
