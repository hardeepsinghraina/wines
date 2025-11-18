const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifySuperAdmin() {
  try {
    console.log('🔍 Verifying superadmin user...')

    const superAdmin = await prisma.user.findUnique({
      where: { email: 'superadmin@wine.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        failedLoginAttempts: true,
        twoFactorEnabled: true,
      }
    })

    if (superAdmin) {
      console.log('✅ Superadmin user found!')
      console.log('📧 Email:', superAdmin.email)
      console.log('👤 Name:', `${superAdmin.firstName} ${superAdmin.lastName}`)
      console.log('🔑 Role:', superAdmin.role)
      console.log('✉️  Email Verified:', superAdmin.emailVerified)
      console.log('🟢 Active:', superAdmin.isActive)
      console.log('🔐 2FA Enabled:', superAdmin.twoFactorEnabled)
      console.log('🚫 Failed Login Attempts:', superAdmin.failedLoginAttempts)
      console.log('📅 Created:', superAdmin.createdAt)
      console.log('🆔 ID:', superAdmin.id)
    } else {
      console.log('❌ Superadmin user not found!')
    }

  } catch (error) {
    console.error('❌ Error verifying superadmin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySuperAdmin()