export interface Tour {
    id?: string;

    clubId: string;
    clubName: string;
    clubPhoto: string;

    name: string;
    date: string;
    difficulty: 'easy' | 'moderate' | 'hard';
    status: 'upcoming' | 'completed' | 'canceled';
    gpxContent: string;
    description: string;
    maxParticipants: number;

    participantsIds: string[];
    participantsNames: string[];
    participantsPhotos: string[];

    photo: string;
}

export interface Application {
tourId: string;
  tourName: string;
  tourDate: string; // Or consider Firestore Timestamp
  tourPhoto?: string;
  clubName: string;
  clubId: string; // To easily identify the club if needed from application context
    userId: string;
id?: string; // Document ID of the application
    userName: string;
    userPhoto: string;

    status: 'pending' | 'accepted' | 'declined' | 'canceled';
    timestamp: string;
    declinedMessage: string;
}

export interface Review {
    userId: string;
    userName: string;
    userPhoto: string;
    
    review: string;
    rating: number;
    timestamp: string;
}