
import { Job, User, VehicleType } from '../types';

const DB_KEY = 'haulhelper_data_v1';
const NETWORK_DELAY = 600; // Simulate 600ms network latency

// Seed data for a fresh database
const INITIAL_DATA = {
  jobs: [
    {
      id: 'job-seed-1',
      title: 'Antique Oak Dresser',
      description: 'Heavy solid wood dresser. Needs two people or a dolly. I can help load.',
      pickupLocation: '123 Maple St, Downtown',
      dropoffLocation: '456 Oak Ln, Suburbs',
      status: 'pending',
      price: 65,
      platformFee: 10,
      vehicleType: VehicleType.PICKUP,
      createdAt: Date.now() - 3600000,
      distanceMiles: 12,
      imageUrl: 'https://picsum.photos/400/300?random=1',
      driverConfirmed: false,
      requesterConfirmed: false
    },
    {
      id: 'job-seed-2',
      title: 'Free Sofa Bed',
      description: 'Good condition, just need it gone by Saturday. It is on the 2nd floor.',
      pickupLocation: '789 Pine Ave, Westside',
      dropoffLocation: '321 Elm St, Northside',
      status: 'pending',
      price: 80,
      platformFee: 12,
      vehicleType: VehicleType.BOX_TRUCK,
      createdAt: Date.now() - 7200000,
      distanceMiles: 8,
      imageUrl: 'https://picsum.photos/400/300?random=2',
      driverConfirmed: false,
      requesterConfirmed: false
    },
    {
      id: 'job-seed-3',
      title: 'Garden Pavers (Leftover)',
      description: 'Stack of about 50 pavers. Easy pickup from driveway.',
      pickupLocation: '55 Garden Way',
      dropoffLocation: '888 River Rd',
      status: 'completed',
      price: 45,
      platformFee: 7,
      vehicleType: VehicleType.SUV,
      createdAt: Date.now() - 172800000, // 2 days ago
      distanceMiles: 5,
      imageUrl: 'https://picsum.photos/400/300?random=3',
      driverConfirmed: true,
      requesterConfirmed: true,
      ratingForDriver: 5
    }
  ] as Job[],
  users: [] as User[]
};

interface DatabaseSchema {
  jobs: Job[];
  users: User[];
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  private getStore(): DatabaseSchema {
    if (typeof window === 'undefined') return INITIAL_DATA;
    
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      this.saveStore(INITIAL_DATA);
      return INITIAL_DATA;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("DB Corrupted, resetting");
      this.saveStore(INITIAL_DATA);
      return INITIAL_DATA;
    }
  }

  private saveStore(data: DatabaseSchema) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
  }

  // --- JOB OPERATIONS ---

  async getJobs(): Promise<Job[]> {
    await delay(NETWORK_DELAY);
    const store = this.getStore();
    // Return sorted by newest
    return store.jobs.sort((a, b) => b.createdAt - a.createdAt);
  }

  async createJob(job: Job): Promise<Job> {
    await delay(NETWORK_DELAY);
    const store = this.getStore();
    store.jobs.unshift(job);
    this.saveStore(store);
    return job;
  }

  async getJobById(id: string): Promise<Job | undefined> {
    await delay(200);
    const store = this.getStore();
    return store.jobs.find(j => j.id === id);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    await delay(NETWORK_DELAY);
    const store = this.getStore();
    const index = store.jobs.findIndex(j => j.id === id);
    
    if (index === -1) throw new Error("Job not found");
    
    const updatedJob = { ...store.jobs[index], ...updates };
    store.jobs[index] = updatedJob;
    this.saveStore(store);
    return updatedJob;
  }

  // --- USER / AUTH OPERATIONS ---

  async login(email: string): Promise<User> {
    await delay(1000); // Login takes a bit longer
    const store = this.getStore();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    return user;
  }

  async signup(user: User): Promise<User> {
    await delay(1000);
    const store = this.getStore();
    
    if (store.users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error("User already exists");
    }
    
    store.users.push(user);
    this.saveStore(store);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(300);
    const store = this.getStore();
    const index = store.users.findIndex(u => u.id === id);
    
    if (index === -1) throw new Error("User not found");
    
    const updatedUser = { ...store.users[index], ...updates };
    store.users[index] = updatedUser;
    this.saveStore(store);
    return updatedUser;
  }
}

export const db = new DatabaseService();
