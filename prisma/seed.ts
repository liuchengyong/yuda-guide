const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.menu.upsert({
    where: { name: '根目录' },
    update: {},
    create: {
      name: '根目录',
      path: '',
      type: 1,
      icon: '',
      code: '',
      parentId: null,
      sort: 0,
      status: 1,
      visible: true,
    },
  })
  await prisma.dept.upsert({
    where: { name: '根部门' },
    update: {},
    create: {
      name: '根部门',
      parentId: null,
      sort: 0,
      status: 1,
      email: '',
      mobile: '',
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
