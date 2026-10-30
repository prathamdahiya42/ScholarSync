import { prisma } from './db';
import { notificationProvider } from './providers';
import { getScholarshipById } from './config-loader';

export async function sendScholarshipNotification(params: {
  studentId: string;
  applicationId?: string;
  scholarshipId: string;
  event: 'APPLICATION_SUBMITTED' | 'APPLICATION_APPROVED' | 'APPLICATION_DEFECTIVE' | 'APPLICATION_REJECTED';
  reason?: string;
  lang?: 'en' | 'hi';
}) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.studentId }
    });
    if (!student) return;

    const scholarship = await getScholarshipById(params.scholarshipId);
    const scholarshipName = scholarship
      ? scholarship.name?.[params.lang || (student.language as 'en' | 'hi') || 'en'] || scholarship.id
      : params.scholarshipId;

    // Find template in scholarship config
    const eventConfig = scholarship?.notifications?.events?.find((e: any) => e.id === params.event);
    const templateText = eventConfig?.text?.[params.lang || (student.language as 'en' | 'hi') || 'en'] ||
      `Your application ${params.applicationId || ''} status is updated to ${params.event}. ${params.reason ? 'Reason: ' + params.reason : ''}`;

    const text = templateText
      .replace(/{{studentName}}/g, student.fullName)
      .replace(/{{applicationId}}/g, params.applicationId || '')
      .replace(/{{scholarshipName}}/g, scholarshipName)
      .replace(/{{reason}}/g, params.reason || '');

    // 1. Create In-App Notification
    await prisma.notification.create({
      data: {
        studentId: student.id,
        applicationId: params.applicationId || null,
        event: params.event,
        channel: 'in_app',
        payloadJson: JSON.stringify({
          studentName: student.fullName,
          applicationId: params.applicationId,
          scholarshipName,
          text,
          reason: params.reason
        }),
        status: 'delivered'
      }
    });

    // 2. Dispatch via Notification Provider (WhatsApp first, then SMS)
    await notificationProvider.send({
      to: student.mobile,
      channel: 'whatsapp',
      templateId: params.event,
      vars: {
        studentName: student.fullName,
        applicationId: params.applicationId || '',
        scholarshipName,
        reason: params.reason || ''
      },
      text
    });
  } catch (err) {
    console.error('[Notification] Dispatch error:', err);
  }
}
