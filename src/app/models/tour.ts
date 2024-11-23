export interface Tour {
    id?: string;
    createdBy: string;
    createdAt: string;
    name: string;
    date: string;
    description: string;
    gpxContent: string;
    difficulty: 'easy' | 'moderate' | 'hard';
    participants: number;
}