export interface Tour {
    createdBy: string;
    createdAt: string;
    name: string;
    date: string;
    description: string;
    gpxFile: File | null;
    difficulty: 'easy' | 'moderate' | 'hard';
    participants: number;
}