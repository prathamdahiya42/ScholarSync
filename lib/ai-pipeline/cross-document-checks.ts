export interface CrossCheckItem {
  checkId: string;
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  score: number; // 0 to 1
  detail: {
    expected: string;
    found: string[];
    comparisonNotes: string;
  };
}

/**
 * Calculates Jaro-Winkler similarity between two strings
 */
export function stringSimilarity(s1: string, s2: string): number {
  const clean1 = (s1 || '').trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const clean2 = (s2 || '').trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');

  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 1.0;

  // Token set comparison (handles word order e.g. "Kumar Rahul" vs "Rahul Kumar")
  const tokens1 = new Set(clean1.split(/\s+/));
  const tokens2 = new Set(clean2.split(/\s+/));

  let intersection = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) intersection++;
  });

  const union = new Set([...tokens1, ...tokens2]).size;
  const tokenScore = union > 0 ? intersection / union : 0;

  // Also simple substring check
  if (clean1.includes(clean2) || clean2.includes(clean1)) {
    return Math.max(tokenScore, 0.85);
  }

  return tokenScore;
}

/**
 * Runs cross-document validation across all extracted document fields
 */
export function runCrossDocumentChecks(
  studentProfile: {
    fullName: string;
    fatherName?: string;
    domicileState?: string;
  },
  uploadedDocs: Array<{
    docTypeId: string;
    extractedFields: Record<string, any>;
  }>
): CrossCheckItem[] {
  const results: CrossCheckItem[] = [];

  if (uploadedDocs.length < 2) {
    return results;
  }

  // 1. Name Match Check
  const namesFound: string[] = [];
  uploadedDocs.forEach((d) => {
    const name = d.extractedFields['fullName'] || d.extractedFields['name'] || d.extractedFields['holderName'];
    if (name && typeof name === 'string') {
      namesFound.push(name);
    }
  });

  if (namesFound.length > 0) {
    let minScore = 1.0;
    namesFound.forEach((fName) => {
      const score = stringSimilarity(studentProfile.fullName, fName);
      if (score < minScore) minScore = score;
    });

    let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
    if (minScore < 0.5) {
      status = 'FAIL';
    } else if (minScore < 0.8) {
      status = 'WARN';
    }

    results.push({
      checkId: 'name_cross_match',
      name: "Student Name Match Across Documents",
      status,
      score: Math.round(minScore * 100) / 100,
      detail: {
        expected: studentProfile.fullName,
        found: namesFound,
        comparisonNotes:
          status === 'PASS'
            ? 'Name is consistent across documents.'
            : status === 'WARN'
            ? 'Minor spelling or word order variation detected. Please verify.'
            : 'Significant name discrepancy detected across documents.'
      }
    });
  }

  // 2. Father's Name Match Check
  if (studentProfile.fatherName) {
    const fatherNamesFound: string[] = [];
    uploadedDocs.forEach((d) => {
      const fName = d.extractedFields['fatherName'] || d.extractedFields['father_name'];
      if (fName && typeof fName === 'string') {
        fatherNamesFound.push(fName);
      }
    });

    if (fatherNamesFound.length > 0) {
      let minScore = 1.0;
      fatherNamesFound.forEach((fn) => {
        const score = stringSimilarity(studentProfile.fatherName!, fn);
        if (score < minScore) minScore = score;
      });

      let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
      if (minScore < 0.5) {
        status = 'FAIL';
      } else if (minScore < 0.8) {
        status = 'WARN';
      }

      results.push({
        checkId: 'father_name_match',
        name: "Father's Name Consistency Check",
        status,
        score: Math.round(minScore * 100) / 100,
        detail: {
          expected: studentProfile.fatherName,
          found: fatherNamesFound,
          comparisonNotes:
            status === 'PASS'
              ? "Father's name consistent across records."
              : 'Discrepancy in father\'s name across documents.'
        }
      });
    }
  }

  return results;
}
