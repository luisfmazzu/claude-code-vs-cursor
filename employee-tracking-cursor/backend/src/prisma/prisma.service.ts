import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Add query logging in development
    if (this.configService.get('NODE_ENV') === 'development') {
      this.$on('query', (event) => {
        console.log('Query: ' + event.query);
        console.log('Params: ' + event.params);
        console.log('Duration: ' + event.duration + 'ms');
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  /**
   * Clean database (for testing purposes)
   */
  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Order matters due to foreign key constraints
    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        } catch (error) {
          console.log(`Error truncating ${tablename}:`, error);
        }
      }
    }
  }

  /**
   * Soft delete helper
   */
  async softDelete(model: string, id: string) {
    return this[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get company context for multi-tenant queries
   */
  async getCompanyContext(companyId: string) {
    const company = await this.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        settings: true,
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  /**
   * Transaction wrapper with company context
   */
  async withCompanyTransaction<T>(
    companyId: string,
    callback: (prisma: PrismaClient, company: any) => Promise<T>,
  ): Promise<T> {
    const company = await this.getCompanyContext(companyId);
    
    return this.$transaction(async (prisma) => {
      return callback(prisma, company);
    });
  }
} 