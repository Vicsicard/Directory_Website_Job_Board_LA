import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const locationSchema = z.object({
  city: z.string().min(1, 'City cannot be empty'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type LocationRecord = {
  city: string;
  state: string;
  latitude?: string;
  longitude?: string;
};

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'locations.csv');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validatedRecords = records.map((record: LocationRecord) => {
      // Convert latitude and longitude to numbers if they exist
      const parsedRecord = {
        ...record,
        latitude: record.latitude ? parseFloat(record.latitude) : undefined,
        longitude: record.longitude ? parseFloat(record.longitude) : undefined,
      };

      return locationSchema.parse(parsedRecord);
    });
    
    return NextResponse.json(validatedRecords);
  } catch (error) {
    console.error('Error reading locations:', error);
    return NextResponse.json({ error: 'Failed to load locations' }, { status: 500 });
  }
}
