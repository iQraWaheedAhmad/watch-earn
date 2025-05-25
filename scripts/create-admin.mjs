import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminPassword = await bcrypt.hash('Imranhelo123@', 10);
    
    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: {
        email: 'admin@gmail.com'
      }
    });

    // Create new admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: adminPassword,
        profile: {
          create: {
            bio: 'System administrator',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
          }
        }
      }
    });

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 