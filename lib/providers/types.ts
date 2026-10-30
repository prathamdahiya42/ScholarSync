export interface OcrResult {
  text: string;
  avgConfidence: number;
  words?: Array<{ text: string; confidence: number; bbox?: any }>;
}

export interface OcrProvider {
  extractText(file: Buffer, mime: string, langs: string[]): Promise<OcrResult>;
}

export interface ExtractorResult {
  fields: Record<string, string | number | null>;
  confidence: number;
  documentTypeGuess?: string;
  isSelfDeclarationOrAffidavit?: boolean;
  hasStampOrSeal?: boolean;
  hasSignature?: boolean;
  legibility?: number;
  notes?: string[];
}

export interface DocumentExtractor {
  extract(
    file: Buffer,
    mime: string,
    docTypeId: string,
    fields: string[],
    ocrText?: string
  ): Promise<ExtractorResult>;
}

export interface StorageProvider {
  put(path: string, data: Buffer): Promise<void>;
  get(path: string): Promise<Buffer>;
  signedUrl(path: string, ttlSec: number): Promise<string>;
}

export interface NotificationMessage {
  to: string;
  channel: 'whatsapp' | 'sms' | 'in_app';
  templateId: string;
  vars: Record<string, string>;
  text: string;
}

export interface NotificationResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface NotificationProvider {
  send(msg: NotificationMessage): Promise<NotificationResult>;
}

export interface OtpProvider {
  sendOtp(mobile: string): Promise<void>;
  verifyOtp(mobile: string, code: string): Promise<boolean>;
}
