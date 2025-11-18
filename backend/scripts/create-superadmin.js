const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('🔐 Creating superadmin user...')

    // Hash the password
    const passwordHash = await bcrypt.hash('Superadmincool123@!#', 12)

    // Create or update the superadmin user
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@wine.com' },
      update: {
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        firstName: 'Super',
        lastName: 'Admin',
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordChangedAt: new Date(),
      },
      create: {
        email: 'superadmin@wine.com',
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        emailVerified: true,
        isActive: true,
        failedLoginAttempts: 0,
        passwordChangedAt: new Date(),
      },
    })

    console.log('✅ Superadmin user created successfully!')
    console.log('📧 Email:', superAdmin.email)
    console.log('👤 Name:', `${superAdmin.firstName} ${superAdmin.lastName}`)
    console.log('🔑 Role:', superAdmin.role)
    console.log('🆔 ID:', superAdmin.id)
    
    console.log('\n🔐 Login credentials:')
    console.log('Email: superadmin@wine.com')
    console.log('Password: Superadmincool123@!#')
    console.log('\n⚠️  Please change the password after first login for security!')

  } catch (error) {
    console.error('❌ Error creating superadmin:', error)
    
    if (error.code === 'P2002') {
      console.log('ℹ️  User already exists. Updating existing user...')
      
      // Try to update existing user
      try {
        const passwordHash = await bcrypt.hash('Superadmincool123@!#', 12)
        const updatedUser = await prisma.user.update({
          where: { email: 'superadmin@wine.com' },
          data: {
            passwordHash,
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true,
            failedLoginAttempts: 0,
            lockedUntil: null,
            passwordChangedAt: new Date(),
          },
        })
        
        console.log('✅ Existing superadmin user updated successfully!')
        console.log('📧 Email:', updatedUser.email)
        console.log('🔑 Role:', updatedUser.role)
      } catch (updateError) {
        console.error('❌ Error updating existing user:', updateError)
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createSuperAdmin()