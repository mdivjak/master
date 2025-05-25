# Issues Overview

## Pending Issues

- [x] Inconsistent Notification Storage and Handling in `NotificationService`.
  - [x] test this manually
- [x] N+1 Query Pattern in `TourService.getUserAppliedTours()` leading to potential performance issues.
- [ ] Lack of Automatic Data Propagation for Denormalized User/Club Information.
- [x] Display of Tour Reviews is not implemented in the UI.
- [x] Potentially Redundant `removeTourParticipant` call in `MyToursComponent.cancelApplication()`.

## Detailed Analysis

### 1. Inconsistent Notification Storage and Handling in `NotificationService`
   - **Description:** The `NotificationService` currently employs two different methods for storing and managing user notifications. Notifications are fetched assuming a subcollection structure (`users/{userId}/notifications/{notificationId}`), but they are sent and marked as read by manipulating an array (`notifications`) directly within the user's document in the `users` collection.
   - **Impact:** This inconsistency can lead to data fragmentation (notifications stored in two places), incorrect notification counts, failure to display all notifications, and errors when trying to mark notifications as read if they are not in the expected location (the array).
   - **Relevant Code:**
     - Fetching (implies subcollection): [`NotificationService.getUserNotifications()`](src/app/services/notification.service.ts:13)
     - Sending (uses array in user doc): [`NotificationService.sendNotification()`](src/app/services/notification.service.ts:23) (specifically the `arrayUnion` on line 32)
     - Marking as read (uses array in user doc): [`NotificationService.markAsRead()`](src/app/services/notification.service.ts:36)
     - Component using subcollection-style fetch: [`NotificationWidgetComponent.ngOnInit()`](src/app/components/notification-widget/notification-widget.component.ts:24)
     - Component using array-style markAsRead: [`NotificationWidgetComponent.markAsRead()`](src/app/components/notification-widget/notification-widget.component.ts:33)
     - Component using array-style send: [`TourParticipantsComponent.acceptApplication()`](src/app/components/tour-participants/tour-participants.component.ts:82) and [`rejectApplication()`](src/app/components/tour-participants/tour-participants.component.ts:63)

### 2. N+1 Query Pattern in `TourService.getUserAppliedTours()`
   - **Description:** The `TourService.getUserAppliedTours()` method first performs a `collectionGroup` query to fetch all applications for a given user. Then, for each application, it makes a separate `getDoc` call to fetch the details of the associated tour.
   - **Impact:** If a user has applied to N tours, this results in N+1 database reads (1 for the applications query + N for individual tour documents). This can lead to increased read costs on Firestore and slower response times for the user, especially if they have many applied tours.
   - **Relevant Code:**
     - The N+1 pattern: [`TourService.getUserAppliedTours()`](src/app/services/tour.service.ts:163), specifically lines 173-176 where `getDoc` is called in a loop.
     - Component using this service method: [`MyToursComponent.getUserAppliedTours()`](src/app/components/my-tours/my-tours.component.ts:32)

### 3. Lack of Automatic Data Propagation for Denormalized User/Club Information
   - **Description:** Several Firestore documents store denormalized user or club information (e.g., `clubName`, `clubPhoto` in tour documents; `userName`, `userPhoto` in application and review documents). When a user or club updates their profile (name or photo), these changes are not automatically propagated to the documents where this information is denormalized.
   - **Impact:** The application may display stale or outdated user/club names and photos in various parts of the UI (tour listings, tour details, application lists, reviews) until the denormalized data is manually updated or a more complex fetching strategy is implemented.
   - **Relevant Denormalized Fields:**
     - In `Tour` model (from [`src/app/models/tour.ts:1`](src/app/models/tour.ts:1)): `clubName`, `clubPhoto`. Also `participantsNames`, `participantsPhotos`.
     - In `Application` model (from [`src/app/models/tour.ts:23`](src/app/models/tour.ts:23)): `userName`, `userPhoto`.
     - In `Review` model (from [`src/app/models/tour.ts:33`](src/app/models/tour.ts:33)): `userName`, `userPhoto`.
   - **Source of Truth for User/Club Data:** `users` collection, updated via [`AuthService.updateUser()`](src/app/services/auth.service.ts:82).

### 4. Display of Tour Reviews is Not Implemented in the UI
   - **Description:** While users can submit reviews for tours (Scenario 11, via `MyToursComponent` and `ReviewModalComponent`, using `TourService.createReview()`), there is no clear UI component or section identified that fetches and displays these reviews to other users (e.g., on the `TourDetailsComponent`).
   - **Impact:** The review functionality is incomplete from an end-user perspective, as submitted reviews are not visible to the wider community or even to the tour creator within the app.
   - **Relevant Code:**
     - Service method to create reviews: [`TourService.createReview()`](src/app/services/tour.service.ts:184)
     - Service method to get reviews (exists but usage for display is unclear): [`TourService.getTourReviews()`](src/app/services/tour.service.ts:188)

### 5. Potentially Redundant `removeTourParticipant` call in `MyToursComponent.cancelApplication()`
   - **Description:** When a hiker cancels their application using `MyToursComponent.cancelApplication()`, the method calls both `TourService.updateApplicationStatus()` to set the application status to "canceled" and `TourService.removeTourParticipant()` to remove them from the tour's participant arrays.
   - **Impact:** If the application was still "pending" and the user had not yet been accepted (i.e., their ID was not in the tour's `participantsIds` array), the call to `removeTourParticipant` would be redundant and attempt to remove a non-existent entry. This is a minor issue but could be optimized for cleaner logic and to avoid unnecessary Firestore writes (if `removeTourParticipant` attempts a write even if the ID isn't found).
   - **Resolution:** Refactored the logic into a new `TourService.cancelUserApplication(tourId, userId)` method. This service method now correctly handles checking the application status and conditionally removing the participant if they were 'accepted', then updates the application status to 'canceled'. The UI for canceling an application was implemented in `TourDetailsComponent` which now calls this new service method. The original `MyToursComponent.cancelApplication()` method was removed as it was unused by its template. This resolves the potential redundancy and ensures correct behavior.
   - **Relevant Code:**
     - Component method: [`MyToursComponent.cancelApplication()`](src/app/components/my-tours/my-tours.component.ts:37), lines 38-39.
     - Service method: [`TourService.removeTourParticipant()`](src/app/services/tour.service.ts:127)