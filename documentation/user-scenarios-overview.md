# User Scenarios & Component Interaction Overview

This document outlines the key user scenarios supported by the application and illustrates component interactions, particularly those involving Firestore database operations.

## Supported User Scenarios:

**I. Authentication & Profile Management:**

1.  **User Registration:** A new user (hiker or club) registers with email, password, and profile details (name, photo, type).

    *   *Components:* `RegisterComponent`
    *   *Services:* `AuthService.register()`
    *   *DB Ops:* Firestore `users` collection write (new document).

2.  **User Login:** An existing user logs in.

    *   *Components:* `LoginComponent`
    *   *Services:* `AuthService.login()`

3.  **User Logout:** A logged-in user logs out.

    *   *Components:* Likely `NavbarComponent`
    *   *Services:* `AuthService.logout()`

4.  **View/Update Hiker Profile:** A hiker views and updates their profile (name, photo).

    *   *Components:* `ProfileHikerComponent`
    *   *Services:* `AuthService.getUserData()`, `AuthService.updateUser()`
    *   *DB Ops:* Firestore `users` read/update.

5.  **View/Update Club Profile:** A club views and updates its profile.

    *   *Components:* `ProfileClubComponent`
    *   *Services:* `AuthService.getUserData()`, `AuthService.updateUser()`
    *   *DB Ops:* Firestore `users` read/update.

**II. Tour Discovery & Interaction (General User/Hiker):**

6.  **View All Tours:** Any user views a list of available hiking tours.

    *   *Components:* `HomeComponent`
    *   *Services:* `TourService.getAllTours()`
    *   *DB Ops:* Firestore `tours` collection read.

7.  **View Tour Details:** Any user views detailed information of a specific tour, including its GPX map.

    *   *Components:* `TourDetailsComponent`, `MapComponent`
    *   *Services:* `TourService.getTour()`
    *   *DB Ops:* Firestore `tours/{tourId}` read.

8.  **Apply for a Tour:** A logged-in hiker applies to participate in a tour.

    *   *Components:* `TourDetailsComponent`
    *   *Services:* `AuthService` (for user info), `TourService.applyForTour()`
    *   *DB Ops:* Firestore `tours/{tourId}/applications/{userId}` write.

9.  **View Own Applied Tours & Status:** A logged-in hiker views tours they've applied to and application statuses.

    *   *Components:* `MyToursComponent`
    *   *Services:* `AuthService`, `TourService.getUserAppliedTours()`
    *   *DB Ops:* Firestore `applications` collectionGroup query + multiple `tours` reads.

10. **Cancel Tour Application:** A hiker cancels their application for a tour.

    *   *Components:* `MyToursComponent`
    *   *Services:* `AuthService`, `TourService.updateApplicationStatus()`, `TourService.removeTourParticipant()`
    *   *DB Ops:* Firestore `applications` update, `tours` update (participant arrays).

11. **Review a Completed Tour:** A hiker submits a rating and review for a tour.

    *   *Components:* `MyToursComponent`, `ReviewModalComponent`
    *   *Services:* `AuthService`, `TourService.createReview()`
    *   *DB Ops:* Firestore `tours/{tourId}/reviews/{reviewId}` write.

**III. Tour Management (Club User):**

12. **Create Hiking Tour:** A logged-in club user creates a new hiking tour.

    *   *Components:* `CreateHikingTourComponent`
    *   *Services:* `AuthService` (for club info), `TourService.createTour()`
    *   *DB Ops:* Firestore `tours` collection write (new document).

13. **View Club's Tours:** A club user views tours they have created.

    *   *Components:* (Assumed, e.g., part of `ProfileClubComponent` or a dedicated view)
    *   *Services:* `TourService.getClubTours()`
    *   *DB Ops:* Firestore `tours` query by `clubId`.

14. **Manage Tour Applications:** A club user views applications for their tours.

    *   *Components:* `TourParticipantsComponent`
    *   *Services:* `TourService.getTour()`, `TourService.getTourApplications()`
    *   *DB Ops:* Firestore `tours/{tourId}` read, `applications` subcollection read.

15. **Accept Tour Application:** A club user accepts a hiker's application.

    *   *Components:* `TourParticipantsComponent`
    *   *Services:* `TourService.updateApplicationStatus()`, `TourService.addTourParticipant()`, `NotificationService.sendNotification()`
    *   *DB Ops:* Firestore `applications` update, `tours` update (participant arrays), user notifications update.

16. **Reject Tour Application:** A club user rejects a hiker's application.

    *   *Components:* `TourParticipantsComponent`
    *   *Services:* `TourService.updateApplicationStatus()`, `NotificationService.sendNotification()`
    *   *DB Ops:* Firestore `applications` update, user notifications update.

**IV. Notifications:**

17. **View Notifications:** A logged-in user views their notifications.

    *   *Components:* `NotificationWidgetComponent`
    *   *Services:* `AuthService`, `NotificationService.getUserNotifications()`
    *   *DB Ops:* Firestore `users/{userId}/notifications` subcollection read (or user doc array read).

18. **Mark Notification as Read:** A user marks a notification as read.

    *   *Components:* `NotificationWidgetComponent`
    *   *Services:* `AuthService`, `NotificationService.markAsRead()`
    *   *DB Ops:* Firestore user doc array update (or subcollection doc update).

## Mermaid Diagram (Key User Flows):

```mermaid
sequenceDiagram
    actor Hiker
    actor Club
    participant UI_Login as "Login/Register UI"
    participant UI_Home as "Home UI (Tour List)"
    participant UI_TourDetails as "Tour Details UI"
    participant UI_MyTours as "My Tours UI"
    participant UI_CreateTour as "Create Tour UI"
    participant UI_TourParticipants as "Tour Participants UI (Club)"
    participant UI_Notifications as "Notifications UI"
    participant AuthService
    participant TourService
    participant NotificationService
    participant FirestoreDB

    %% --- Hiker Applies for Tour & Club Manages ---
    Hiker->>UI_Home: Views tours
    UI_Home->>TourService: getAllTours()
    TourService->>FirestoreDB: Read /tours
    FirestoreDB-->>TourService: Tour List
    TourService-->>UI_Home: Display tours

    Hiker->>UI_TourDetails: Selects tour
    UI_TourDetails->>TourService: getTour(tourId)
    TourService->>FirestoreDB: Read /tours/{tourId}
    UI_TourDetails->>TourService: getUserApplication(hikerId)
    TourService->>FirestoreDB: Read /tours/{tourId}/applications/{hikerId}
    FirestoreDB-->>TourService: Tour & App Status
    TourService-->>UI_TourDetails: Display details

    Hiker->>UI_TourDetails: Clicks "Apply"
    UI_TourDetails->>TourService: applyForTour(hikerInfo)
    TourService->>FirestoreDB: Write /tours/{tourId}/applications/{hikerId}

    Club->>UI_TourParticipants: Manages applications for tourId
    UI_TourParticipants->>TourService: getTourApplications(tourId)
    TourService->>FirestoreDB: Read /tours/{tourId}/applications
    FirestoreDB-->>TourService: Application List
    TourService-->>UI_TourParticipants: Display applications

    Club->>UI_TourParticipants: Accepts Hiker's application
    UI_TourParticipants->>TourService: updateApplicationStatus("accepted")
    TourService->>FirestoreDB: Update /tours/{tourId}/applications/{hikerId}
    UI_TourParticipants->>TourService: addTourParticipant(hikerInfo)
    TourService->>FirestoreDB: Update /tours/{tourId} (participant arrays)
    UI_TourParticipants->>NotificationService: sendNotification(hikerId, "accepted")
    NotificationService->>FirestoreDB: Write notification for Hiker

    Hiker->>UI_Notifications: Checks notifications
    UI_Notifications->>NotificationService: getUserNotifications(hikerId)
    NotificationService->>FirestoreDB: Read Hiker's notifications
    FirestoreDB-->>NotificationService: Notification List
    NotificationService-->>UI_Notifications: Display "Application Accepted"

    %% --- Club Creates Tour ---
    Club->>UI_CreateTour: Fills tour form
    UI_CreateTour->>AuthService: Get Club Info
    AuthService-->>UI_CreateTour: Club ID, Name, Photo
    UI_CreateTour->>TourService: createTour(tourData)
    TourService->>FirestoreDB: Write new /tours document
    FirestoreDB-->>TourService: New Tour ID
    TourService-->>UI_CreateTour: Confirmation