import prisma from './prisma/client.js'

async function main() {
  const tables = await prisma.$queryRaw`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='learnerprofile'`
  console.log('tables:', JSON.stringify(tables, null, 2))
  const profiles = await prisma.learnerProfile.findMany({ take: 1 })
  console.log('profiles count:', profiles.length)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
