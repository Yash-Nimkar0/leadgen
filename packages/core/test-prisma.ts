import { PrismaClient, AlertChannel, AlertStatus } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log("Connecting...");
    
    // get random project lead
    const lead = await prisma.projectLead.findFirst();
    if (!lead) {
      console.log("No lead found");
      return;
    }

    console.log("Creating alert for lead", lead.id);
    const alert = await prisma.alert.create({
      data: {
        projectLeadId: lead.id,
        channel: AlertChannel.EMAIL,
        status: AlertStatus.PENDING,
        attemptCount: 1,
        lastAttemptAt: new Date()
      }
    });

    console.log("Alert created", alert.id);

    await prisma.alert.delete({ where: { id: alert.id } });
    console.log("Alert deleted");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
