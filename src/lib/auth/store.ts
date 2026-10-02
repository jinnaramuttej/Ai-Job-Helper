import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'student';
}

export interface UserStore {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
}

export class JsonFileUserStore implements UserStore {
  private filePath: string;
  private queue: Promise<void> = Promise.resolve();
  
  constructor(filePath: string) {
    this.filePath = filePath;
  }
  
  private async ensureInitialized(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      let users: User[] = [];
      if (adminEmail && adminPassword) {
        users.push({
          id: '1',
          email: adminEmail.toLowerCase().trim(),
          passwordHash: await bcrypt.hash(adminPassword, 10),
          name: 'Admin',
          role: 'admin'
        });
      }
      await this.writeUsers(users);
    }
  }

  private async readUsers(): Promise<User[]> {
    await this.ensureInitialized();
    const data = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(data) as User[];
  }

  private async writeUsers(users: User[]): Promise<void> {
    const tempFile = `${this.filePath}.tmp.${Date.now()}.${Math.random()}`;
    await fs.writeFile(tempFile, JSON.stringify(users, null, 2), 'utf-8');
    await fs.rename(tempFile, this.filePath);
  }
  
  private async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          resolve(await task());
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.enqueue(async () => {
      const users = await this.readUsers();
      const normalized = email.toLowerCase().trim();
      return users.find(u => u.email === normalized) || null;
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.enqueue(async () => {
      const users = await this.readUsers();
      return users.find(u => u.id === id) || null;
    });
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    return this.enqueue(async () => {
      const users = await this.readUsers();
      const normalizedEmail = user.email.toLowerCase().trim();
      if (users.some(u => u.email === normalizedEmail)) {
        throw new Error('Email already exists');
      }
      
      const nextId = users.length > 0 ? Math.max(...users.map(u => parseInt(u.id, 10) || 0)) + 1 : 1;
      const newUser: User = {
        ...user,
        id: nextId.toString(),
        email: normalizedEmail,
      };
      
      users.push(newUser);
      await this.writeUsers(users);
      return newUser;
    });
  }
}

const dataDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
export const store = new JsonFileUserStore(path.join(dataDir, 'users.json'));
