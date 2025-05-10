const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initMenuData() {
  const existing = await prisma.menu.findFirst({
    where: {
      name: '根目录',
      deletedAt: null,
    },
  })
  if (!existing) {
    await prisma.menu.create({
      data: {
        name: '根目录',
        type: 1,
        sort: 0,
        status: 1,
        visible: true,
      },
    })
  }
}
async function initDeptData() {
  const existing = await prisma.dept.findFirst({
    where: {
      name: '根部门',
      deletedAt: null,
    },
  })
  if (!existing) {
    await prisma.dept.create({
      data: {
        name: '根部门',
        sort: 0,
        status: 1,
      },
    })
  }
}
async function main() {
  initMenuData()
  initDeptData()
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
