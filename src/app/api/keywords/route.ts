import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const keywordSchema = z.object({
  keyword: z.string().min(1, 'Keyword cannot be empty'),
  category: z.string().optional(),
});

type KeywordRecord = z.infer<typeof keywordSchema>;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'keywords.csv');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validatedRecords = records.map((record: KeywordRecord) => keywordSchema.parse(record));
    
    return NextResponse.json(validatedRecords);
  } catch (error) {
    console.error('Error reading keywords:', error);
    return NextResponse.json({ error: 'Failed to load keywords' }, { status: 500 });
  }
}
