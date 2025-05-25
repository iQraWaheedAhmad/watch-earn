import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');

    // Create admin user with credentials from .env
    const adminPassword = await bcrypt.hash('Imranhelo123@', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {
        password: adminPassword // Update password even if user exists
      },
      create: {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: adminPassword,
        profile: {
          create: {
            bio: 'System administrator',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log('Created/Updated admin user:', admin.email);

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'user@example.com',
        password: userPassword,
        profile: {
          create: {
            bio: 'Regular user account',
            avatar: 'https://ui-avatars.com/api/?name=Test+User&background=4CAF50&color=fff'
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log('Created test user:', user.email);
    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
