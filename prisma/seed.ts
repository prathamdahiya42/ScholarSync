import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { encryptBankAccount, maskBankAccount } from '../lib/crypto.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Staff Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const reviewerPasswordHash = await bcrypt.hash('Reviewer@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: { passwordHash: adminPasswordHash, role: 'admin', name: 'Platform Admin' },
    create: {
      email: 'admin@demo.local',
      passwordHash: adminPasswordHash,
      role: 'admin',
      name: 'Platform Admin'
    }
  });
  console.log(`✅ Admin user seeded: ${admin.email} (Password: Admin@123)`);

  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@demo.local' },
    update: { passwordHash: reviewerPasswordHash, role: 'management_reviewer', name: 'Verification Officer' },
    create: {
      email: 'reviewer@demo.local',
      passwordHash: reviewerPasswordHash,
      role: 'management_reviewer',
      name: 'Verification Officer'
    }
  });
  console.log(`✅ Reviewer user seeded: ${reviewer.email} (Password: Reviewer@123)`);

  // 2. Load & Seed Scholarships from config files
  const configDir = path.join(process.cwd(), 'config/scholarships');
  const files = ['pre-matric-st.json', 'sample-merit-demo.json'];

  for (const file of files) {
    const fullPath = path.join(configDir, file);
    if (fs.existsSync(fullPath)) {
      const config = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      await prisma.scholarship.upsert({
        where: { id: config.id },
        update: {
          nameJson: JSON.stringify(config.name),
          status: config.status || 'active',
          academicYear: config.academicYear || '2026-27',
          version: config.schemaVersion || '1.0',
          configJson: JSON.stringify(config)
        },
        create: {
          id: config.id,
          nameJson: JSON.stringify(config.name),
          status: config.status || 'active',
          academicYear: config.academicYear || '2026-27',
          version: config.schemaVersion || '1.0',
          configJson: JSON.stringify(config)
        }
      });
      console.log(`✅ Scholarship seeded: ${config.id}`);
    }
  }

  // 3. Seed Students
  // Student 1: Eligible ST Class IX student
  const student1Acc = '1122334455664321';
  const student1 = await prisma.student.upsert({
    where: { mobile: '9876543210' },
    update: {},
    create: {
      mobile: '9876543210',
      fullName: 'Birsa Munda',
      fatherName: 'Sugana Munda',
      dob: '2011-04-14',
      gender: 'male',
      email: 'birsa.munda@demo.local',
      socialCategory: 'ST',
      domicileState: 'Jharkhand',
      district: 'Ranchi',
      currentClass: 'Class IX',
      schoolName: 'Govt Tribal High School, Khunti',
      isHosteller: false,
      hasDisability: false,
      aadhaarLast4: '4321',
      bankAccountEnc: encryptBankAccount(student1Acc),
      bankAccountMasked: maskBankAccount(student1Acc),
      ifsc: 'SBIN0001234',
      bankName: 'State Bank of India',
      bankHolderName: 'Birsa Munda',
      language: 'en',
      guardianConsentAt: new Date()
    }
  });
  console.log(`✅ Student 1 (Eligible ST) seeded: ${student1.fullName} (${student1.mobile})`);

  // Student 2: ST student with income above limit
  const student2Acc = '9988776655447890';
  const student2 = await prisma.student.upsert({
    where: { mobile: '9876543211' },
    update: {},
    create: {
      mobile: '9876543211',
      fullName: 'Ramesh Oraon',
      fatherName: 'Mangra Oraon',
      dob: '2010-08-20',
      gender: 'male',
      email: 'ramesh.oraon@demo.local',
      socialCategory: 'ST',
      domicileState: 'Jharkhand',
      district: 'Gumla',
      currentClass: 'Class IX',
      schoolName: 'Model Secondary School',
      isHosteller: true,
      hasDisability: false,
      aadhaarLast4: '7890',
      bankAccountEnc: encryptBankAccount(student2Acc),
      bankAccountMasked: maskBankAccount(student2Acc),
      ifsc: 'PUNB0123400',
      bankName: 'Punjab National Bank',
      bankHolderName: 'Ramesh Oraon',
      language: 'hi',
      guardianConsentAt: new Date()
    }
  });
  console.log(`✅ Student 2 (High-Income ST) seeded: ${student2.fullName} (${student2.mobile})`);

  // Student 3: General category student
  const student3Acc = '5544332211001122';
  const student3 = await prisma.student.upsert({
    where: { mobile: '9876543212' },
    update: {},
    create: {
      mobile: '9876543212',
      fullName: 'Priya Sharma',
      fatherName: 'Rajesh Sharma',
      dob: '2011-01-10',
      gender: 'female',
      email: 'priya.sharma@demo.local',
      socialCategory: 'GENERAL',
      domicileState: 'Delhi',
      district: 'North West Delhi',
      currentClass: 'Class IX',
      schoolName: 'Delhi Public School',
      isHosteller: false,
      hasDisability: false,
      aadhaarLast4: '1122',
      bankAccountEnc: encryptBankAccount(student3Acc),
      bankAccountMasked: maskBankAccount(student3Acc),
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
      bankHolderName: 'Priya Sharma',
      language: 'en',
      guardianConsentAt: new Date()
    }
  });
  console.log(`✅ Student 3 (General Category) seeded: ${student3.fullName} (${student3.mobile})`);

  // 4. Seed a Sample Demo Application for Student 1 in SUBMITTED state for Reviewer testing
  const appId = 'SCH-2026-000101';
  const existingApp = await prisma.application.findUnique({ where: { id: appId } });

  if (!existingApp) {
    const app = await prisma.application.create({
      data: {
        id: appId,
        studentId: student1.id,
        scholarshipId: 'pre-matric-st-css',
        configVersion: '1.0',
        type: 'fresh',
        status: 'SUBMITTED',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        eligibilityResult: JSON.stringify({
          eligible: true,
          applicationType: 'fresh',
          answeredAt: new Date()
        }),
        benefitRate: JSON.stringify({
          category: 'dayScholar',
          monthly: 225,
          annual: 2250,
          booksGrant: 750,
          total: 3000
        }),
        answers: {
          create: [
            { questionId: 'q_st', answer: 'yes' },
            { questionId: 'q_class', answer: 'yes' },
            { questionId: 'q_school', answer: 'yes' },
            { questionId: 'q_orphan', answer: 'no' },
            { questionId: 'q_income', answer: 'yes' },
            { questionId: 'q_bank', answer: 'yes' },
            { questionId: 'q_other', answer: 'no' },
            { questionId: 'q_repeat', answer: 'no' },
            { questionId: 'q_prev_awardee', answer: 'no' }
          ]
        }
      }
    });

    // Seed sample documents with AiCheck records
    const sampleUploadDir = path.join(process.cwd(), 'uploads/documents');
    if (!fs.existsSync(sampleUploadDir)) {
      fs.mkdirSync(sampleUploadDir, { recursive: true });
    }

    const docDefs = [
      {
        docTypeId: 'aadhaar',
        fileName: 'aadhaar_birsa.txt',
        content: 'GOVERNMENT OF INDIA\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\nName: Birsa Munda\nDOB: 14/04/2011\nGender: Male\nAadhaar: XXXX XXXX 4321',
        extracted: { fullName: 'Birsa Munda', dob: '2011-04-14', gender: 'male', aadhaarLast4: '4321' }
      },
      {
        docTypeId: 'domicile',
        fileName: 'domicile_birsa.txt',
        content: 'GOVERNMENT OF JHARKHAND\nOFFICE OF THE CIRCLE OFFICER, KHUNTI\nDOMICILE CERTIFICATE\nThis is to certify that Birsa Munda S/o Sugana Munda is a permanent resident of Village Ulihatu, District Khunti, State Jharkhand.\nIssuing Authority: Circle Officer\nIssue Date: 12-05-2025\nCertificate No: JH/DOM/2025/8921',
        extracted: { fullName: 'Birsa Munda', fatherName: 'Sugana Munda', state: 'Jharkhand', district: 'Khunti', issuingAuthority: 'Circle Officer' }
      },
      {
        docTypeId: 'st_certificate',
        fileName: 'caste_cert_birsa.txt',
        content: 'GOVERNMENT OF JHARKHAND\nOFFICE OF SUB-DIVISIONAL OFFICER, KHUNTI\nSCHEDULED TRIBE CASTE CERTIFICATE\nThis is to certify that Shri Birsa Munda Son of Shri Sugana Munda belongs to Munda community which is recognized as a Scheduled Tribe in the State of Jharkhand.\nCertificate No: JH/ST/2025/4412\nIssuing Authority: Sub-Divisional Officer',
        extracted: { fullName: 'Birsa Munda', fatherName: 'Sugana Munda', community: 'Munda', state: 'Jharkhand', issuingAuthority: 'Sub-Divisional Officer' }
      },
      {
        docTypeId: 'income_certificate',
        fileName: 'income_cert_birsa.txt',
        content: 'GOVERNMENT OF JHARKHAND\nREVENUE AND LAND REFORMS DEPARTMENT\nINCOME CERTIFICATE (NOT AN AFFIDAVIT)\nThis is to certify that the annual family income from all sources of Shri Sugana Munda, father of Birsa Munda, is Rs. 1,45,000 (Rupees One Lakh Forty Five Thousand only).\nDate of Issue: 18-06-2026\nAuthority: Tehsildar Khunti',
        extracted: { fullName: 'Birsa Munda', fatherName: 'Sugana Munda', annualIncomeInr: 145000, issuingAuthority: 'Tehsildar Khunti' }
      },
      {
        docTypeId: 'bank_proof',
        fileName: 'bank_passbook_birsa.txt',
        content: 'STATE BANK OF INDIA\nBRANCH: KHUNTI BAZAR\nACCOUNT PASSBOOK\nAccount Holder: Birsa Munda\nAccount Number: 1122334455664321\nIFSC Code: SBIN0001234\nMICR: 835002001',
        extracted: { holderName: 'Birsa Munda', bankAccountNumber: '1122334455664321', ifsc: 'SBIN0001234', accountLast4: '4321' }
      }
    ];

    for (const d of docDefs) {
      const storagePath = `${appId}/${d.fileName}`;
      fs.writeFileSync(path.join(sampleUploadDir, d.fileName), d.content);

      const doc = await prisma.document.create({
        data: {
          applicationId: app.id,
          docTypeId: d.docTypeId,
          storagePath: d.fileName,
          fileName: d.fileName,
          mime: 'text/plain',
          sizeBytes: d.content.length,
          version: 1,
          aiChecks: {
            create: {
              status: 'PASS',
              confidence: 0.95,
              ocrText: d.content,
              extractedJson: JSON.stringify(d.extracted),
              messagesJson: JSON.stringify([{ en: 'Document verified successfully.', hi: 'दस्तावेज़ सफलतापूर्वक सत्यापित हुआ।' }]),
              flagsJson: JSON.stringify([`OCR match verified for ${d.docTypeId}`])
            }
          }
        }
      });
    }

    // Seed Cross-Checks
    await prisma.crossCheck.createMany({
      data: [
        {
          applicationId: app.id,
          checkId: 'name_cross_match',
          status: 'PASS',
          detailJson: JSON.stringify({
            expected: 'Birsa Munda',
            found: ['Birsa Munda'],
            comparisonNotes: 'Name strictly matches across all official records.'
          })
        },
        {
          applicationId: app.id,
          checkId: 'father_name_match',
          status: 'PASS',
          detailJson: JSON.stringify({
            expected: 'Sugana Munda',
            found: ['Sugana Munda'],
            comparisonNotes: 'Father name matches domicile, caste, and income certificates.'
          })
        }
      ]
    });

    // Seed Initial Notification
    await prisma.notification.create({
      data: {
        studentId: student1.id,
        applicationId: app.id,
        event: 'APPLICATION_SUBMITTED',
        channel: 'in_app',
        payloadJson: JSON.stringify({
          studentName: 'Birsa Munda',
          applicationId: app.id,
          scholarshipName: 'Pre-Matric Scholarship for ST Students (Classes IX & X)'
        }),
        status: 'delivered'
      }
    });

    console.log(`✅ Demo Application seeded: ${app.id} for ${student1.fullName} in SUBMITTED state`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
