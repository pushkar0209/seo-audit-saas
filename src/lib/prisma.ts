import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    })

// Add Prisma Extension to automatically filter by Tenant ID if desired,
// OR simply use Prisma Client standard approaches. As a SaaS, you typically
// use Prisma Client extensions (`prisma.$extends`) for tenant isolation.
export function getTenantPrisma(tenantId: string) {
    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ model, args, query }) {
                    // If the model isn't Tenant itself, we implicitly filter by tenantId
                    if (model !== 'Tenant') {
                        // @ts-expect-error - args.where is untyped dynamically here
                        args.where = { ...args.where, tenantId }
                    }
                    return query(args)
                },
            },
        },
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
