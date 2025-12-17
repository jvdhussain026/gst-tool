import { config } from 'dotenv';
config();

import '@/ai/flows/invoice-type-detection.ts';
import '@/ai/flows/data-extraction-and-validation.ts';
import '@/ai/flows/duplicate-invoice-detection.ts';