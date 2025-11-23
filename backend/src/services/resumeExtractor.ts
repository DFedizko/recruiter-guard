import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import type { FileArray } from 'express-fileupload';

export async function extractTextFromResume(
  file: FileArray | undefined,
  textInput?: string
): Promise<string> {
  if (textInput && textInput.trim()) {
    return textInput.trim();
  }

  if (!file || !file.resume) {
    throw new Error('No resume file or text provided');
  }

  const resumeFile = Array.isArray(file.resume) ? file.resume[0] : file.resume;
  const buffer = resumeFile.data;

  const fileName = resumeFile.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (fileName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  } else {
    return buffer.toString('utf-8');
  }
}

