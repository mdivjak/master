export interface Application {
    status: 'pending' | 'accepted' | 'declined' | 'canceled';
    appliedAt: string; // Timestamp of when the participant applied
}
  
export interface Tour {
    id?: string;
    createdBy: string; // User ID of the hiking club that created the tour
    createdAt: string; // Timestamp of when the tour was created
    name: string;
    date: string;
    description: string;
    gpxContent: string;
    difficulty: 'easy' | 'moderate' | 'hard';
    participants: number;
}