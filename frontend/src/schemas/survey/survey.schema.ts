import { z } from 'zod';

export const surveySchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(80, 'Nama terlalu panjang'),
  review: z
    .string()
    .min(10, 'Review minimal 10 karakter')
    .max(280, 'Review maksimal 280 karakter'),
});

export type SurveyFormData = z.infer<typeof surveySchema>;
