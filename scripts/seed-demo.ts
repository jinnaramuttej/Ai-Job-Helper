import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const DEMO_EMAIL = 'ananya.sharma@college.edu';
const DEMO_PASSWORD = 'password123';

async function seedDemo() {
  const filePath = path.join(process.cwd(), 'data', 'users.json');
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    let users = [];
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      users = JSON.parse(data);
    } catch {
      // File doesn't exist yet, that's fine
    }

    const normalizedEmail = DEMO_EMAIL.toLowerCase().trim();
    if (users.some((u: any) => u.email === normalizedEmail)) {
      console.log('Demo user already seeded.');
      return;
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const nextId = users.length > 0 ? Math.max(...users.map((u: any) => parseInt(u.id, 10) || 0)) + 1 : 1;
    
    users.push({
      id: nextId.toString(),
      email: normalizedEmail,
      name: 'Ananya Sharma',
      passwordHash,
      role: 'student'
    });

    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');
    console.log(`Demo user seeded: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } catch (error) {
    console.error('Error seeding demo user:', error);
  }
}

seedDemo();
