export interface DocumentCheckResult {
  status: 'PASS' | 'WARN' | 'FAIL';
  extractedFields: Record<string, string | number | null>;
  studentMessages: Array<{ en: string; hi: string }>;
  reviewerFlags: string[];
}

/**
 * Rules and checks executed per document type
 */
export function checkDocumentRules(
  docTypeId: string,
  ocrText: string,
  extractedFields: Record<string, any>,
  studentProfile: {
    fullName: string;
    fatherName?: string;
    dob?: string;
    domicileState?: string;
    currentClass?: string;
    schoolName?: string;
  },
  maxIncomeInr: number = 250000
): DocumentCheckResult {
  const text = (ocrText || '').toLowerCase();
  const studentMessages: Array<{ en: string; hi: string }> = [];
  const reviewerFlags: string[] = [];
  let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';

  switch (docTypeId) {
    case 'aadhaar': {
      // Look for 4 digits or masked format (e.g. XXXX XXXX 1234)
      const aadhaarPattern = /\b\d{4}\s*\d{4}\s*(\d{4})\b|\b[X\*\.]{4}\s*[X\*\.]{4}\s*(\d{4})\b/;
      const match = ocrText.match(aadhaarPattern);
      const last4 = match ? (match[1] || match[2]) : extractedFields['aadhaarLast4'] || extractedFields['aadhaar_last_4'];

      if (!last4 && !text.includes('aadhaar') && !text.includes('आधार') && !text.includes('uidai')) {
        status = 'WARN';
        studentMessages.push({
          en: 'Aadhaar document type could not be fully confirmed. A human reviewer will inspect it.',
          hi: 'आधार दस्तावेज़ की पुष्टि नहीं हो सकी। एक अधिकारी इसकी जाँच करेगा।'
        });
        reviewerFlags.push('Aadhaar keyword or 12-digit pattern not clearly detected in OCR.');
      } else {
        extractedFields['aadhaarLast4'] = last4 ? String(last4).slice(-4) : 'VALID';
      }
      break;
    }

    case 'st_certificate': {
      const stKeywords = [
        'scheduled tribe',
        'अनुसूचित जनजाति',
        'tribe',
        'caste certificate',
        'जाति प्रमाण पत्र',
        'praman patra'
      ];
      const hasStKeyword = stKeywords.some((kw) => text.includes(kw));

      if (!hasStKeyword) {
        status = 'WARN';
        studentMessages.push({
          en: 'ST certificate keywords were faint or in local script. Sent for manual officer verification.',
          hi: 'एसटी प्रमाण पत्र के मुख्य शब्द स्पष्ट नहीं थे। मैनुअल सत्यापन के लिए भेजा गया।'
        });
        reviewerFlags.push('ST keyword absent in OCR; verify certificate authenticity manually.');
      }

      // Check community name
      if (extractedFields['community']) {
        reviewerFlags.push(`Extracted community: ${extractedFields['community']}. Check against official State ST list.`);
      } else {
        reviewerFlags.push('Community name not extracted via OCR. Verify community manually.');
      }
      break;
    }

    case 'income_certificate': {
      // 1. Strictly FAIL if affidavit or self-declaration
      const affidavitKeywords = [
        'affidavit',
        'शपथ पत्र',
        'शपथ-पत्र',
        'self declaration',
        'self-declaration',
        'swaghoshna',
        'notary'
      ];
      const isAffidavit = affidavitKeywords.some((kw) => text.includes(kw));
      if (isAffidavit) {
        status = 'FAIL';
        studentMessages.push({
          en: 'A self-declaration or notary affidavit is NOT accepted. An official government Income Certificate from your State authority (e.g. Tehsildar) is required.',
          hi: 'स्व-घोषणा या नोटरी शपथ पत्र स्वीकार्य नहीं है। राज्य के सक्षम प्राधिकारी (जैसे तहसीलदार) से सरकारी आय प्रमाण पत्र आवश्यक है।'
        });
        reviewerFlags.push('REJECTED: Document detected as self-declaration/affidavit instead of official certificate.');
        break;
      }

      // 2. Check Income amount
      let incomeVal = Number(extractedFields['annualIncomeInr'] || extractedFields['annual_income'] || 0);
      if (!incomeVal) {
        // Regex search for income numbers
        const numMatches = text.match(/(?:income|आय|rs\.?|inr)\s*[:=\-]?\s*(\d{4,7})/i);
        if (numMatches && numMatches[1]) {
          incomeVal = parseInt(numMatches[1], 10);
        }
      }

      if (incomeVal > 0) {
        if (incomeVal > maxIncomeInr) {
          status = 'FAIL';
          studentMessages.push({
            en: `The annual family income Rs. ${incomeVal.toLocaleString()} exceeds the scholarship ceiling of Rs. ${maxIncomeInr.toLocaleString()}.`,
            hi: `वार्षिक पारिवारिक आय ₹${incomeVal.toLocaleString()} छात्रवृत्ति सीमा ₹${maxIncomeInr.toLocaleString()} से अधिक है।`
          });
          reviewerFlags.push(`FAIL: Annual income ₹${incomeVal} exceeds limit ₹${maxIncomeInr}.`);
        } else {
          studentMessages.push({
            en: `Income of Rs. ${incomeVal.toLocaleString()} is within the eligible limit.`,
            hi: `पारिवारिक आय ₹${incomeVal.toLocaleString()} पात्रता सीमा के भीतर है।`
          });
        }
      } else {
        status = 'WARN';
        studentMessages.push({
          en: 'Income amount could not be read automatically. An officer will manually verify your income certificate.',
          hi: 'आय राशि स्वचालित रूप से नहीं पढ़ी जा सकी। अधिकारी मैनुअल सत्यापन करेंगे।'
        });
        reviewerFlags.push('Annual income figure could not be parsed automatically.');
      }
      break;
    }

    case 'domicile': {
      const domicileKeywords = ['domicile', 'residence', 'निवास', 'स्थायी निवासी', 'bonafide'];
      const hasKeyword = domicileKeywords.some((kw) => text.includes(kw));
      if (!hasKeyword) {
        status = 'WARN';
        reviewerFlags.push('Domicile certificate heading not detected in OCR.');
      }

      if (studentProfile.domicileState) {
        const stateLower = studentProfile.domicileState.toLowerCase();
        if (!text.includes(stateLower)) {
          reviewerFlags.push(`Verify: State name "${studentProfile.domicileState}" not matched in document text.`);
        }
      }
      break;
    }

    case 'bank_proof': {
      const ifscRegex = /[A-Z]{4}0[A-Z0-9]{6}/i;
      const ifscMatch = (ocrText || '').match(ifscRegex);
      if (ifscMatch) {
        extractedFields['ifsc'] = ifscMatch[0].toUpperCase();
      } else {
        reviewerFlags.push('IFSC code pattern not detected on bank document.');
      }

      const accMatch = (ocrText || '').match(/\b\d{9,18}\b/);
      if (accMatch) {
        extractedFields['accountLast4'] = accMatch[0].slice(-4);
      }
      break;
    }

    case 'school_proof': {
      const classKeywords = ['class ix', 'class x', 'कक्षा 9', 'कक्षा 10', 'class 9', 'class 10'];
      const hasClass = classKeywords.some((kw) => text.includes(kw));
      if (!hasClass) {
        reviewerFlags.push('Class IX / X not explicitly mentioned in school certificate.');
      }
      break;
    }

    default:
      break;
  }

  return {
    status,
    extractedFields,
    studentMessages,
    reviewerFlags
  };
}
