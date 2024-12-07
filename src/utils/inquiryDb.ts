import { MongoClient, ObjectId } from 'mongodb';
import { InquiryFormData } from '@/types/inquiry';
import { withRetry } from './errorRecovery';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = 'local_services_directory';
const COLLECTION_NAME = 'inquiries';

let cachedClient: MongoClient | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;
  return client;
}

export async function saveInquiry(inquiry: InquiryFormData) {
  return withRetry(async () => {
    const client = await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const result = await collection.insertOne({
      ...inquiry,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'new'
    });

    return {
      success: true,
      inquiryId: result.insertedId.toString(),
      message: 'Inquiry submitted successfully'
    };
  }, {
    maxRetries: 3,
    baseDelay: 1000,
    exponential: true
  });
}

export async function getInquiry(inquiryId: string) {
  return withRetry(async () => {
    const client = await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const inquiry = await collection.findOne({
      _id: new ObjectId(inquiryId)
    });

    return inquiry;
  }, {
    maxRetries: 3,
    baseDelay: 1000,
    exponential: true
  });
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryFormData['status']) {
  return withRetry(async () => {
    const client = await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const result = await collection.updateOne(
      { _id: new ObjectId(inquiryId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    return {
      success: result.modifiedCount === 1,
      message: result.modifiedCount === 1
        ? 'Inquiry status updated successfully'
        : 'Failed to update inquiry status'
    };
  }, {
    maxRetries: 3,
    baseDelay: 1000,
    exponential: true
  });
}

export async function getInquiriesByEmail(email: string) {
  return withRetry(async () => {
    const client = await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    return await collection
      .find({ email })
      .sort({ createdAt: -1 })
      .toArray();
  }, {
    maxRetries: 3,
    baseDelay: 1000,
    exponential: true
  });
}

export async function deleteInquiry(inquiryId: string) {
  return withRetry(async () => {
    const client = await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const result = await collection.deleteOne({
      _id: new ObjectId(inquiryId)
    });

    return {
      success: result.deletedCount === 1,
      message: result.deletedCount === 1
        ? 'Inquiry deleted successfully'
        : 'Failed to delete inquiry'
    };
  }, {
    maxRetries: 3,
    baseDelay: 1000,
    exponential: true
  });
}
