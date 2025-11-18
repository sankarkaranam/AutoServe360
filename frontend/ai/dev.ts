import { config } from 'dotenv';
config();

import '@/ai/flows/ai-import-csv.ts';
import '@/ai/flows/optimize-campaign-send-time.ts';
import '@/ai/flows/smart-dashboard-assistant.ts';
import '@/ai/flows/predict-service-reminders.ts';