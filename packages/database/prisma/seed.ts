import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // This script deletes every row in every table before seeding dev data. It must never
  // run against a production database. Guard on NODE_ENV rather than trusting the caller
  // to remember not to run `prisma db seed` with the wrong DATABASE_URL active.
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run: seed.ts deletes all data and NODE_ENV=production.');
    process.exit(1);
  }

  await prisma.projectLead.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.redditPost.deleteMany();
  await prisma.ingestionRun.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.monitoredSource.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();

  // Generate a random password for the dev user
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('dev-password-local-only', 10);

  // 1. Create a Test User
  const user = await prisma.user.create({
    data: {
      email: 'founder@example.com',
      password: hashedPassword,
      preferences: {
        create: {
          minimumIntentScore: 70,
          notificationFrequency: 'REALTIME',
        },
      },
      projects: {
        create: {
          name: 'Reddit Intent',
          productDescription: 'A SaaS that finds Reddit conversations where people are actively expressing a problem, evaluating solutions, asking for recommendations, looking for alternatives, or demonstrating other commercially useful buying intent.',
          keywords: {
            create: [
              { keyword: 'lead generation', type: 'PROBLEM' },
              { keyword: 'competitorxyz', type: 'COMPETITOR' },
              { keyword: 'intercom', type: 'COMPETITOR' },
              { keyword: 'zendesk', type: 'COMPETITOR' },
              { keyword: 'customer support', type: 'PROBLEM' },
            ],
          },
          sources: {
            create: [
              { sourceType: 'SUBREDDIT', sourceIdentifier: 'SaaS' },
            ],
          },
        },
      },
    },
  });

  console.log('Seed executed: created test user and project.', user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
