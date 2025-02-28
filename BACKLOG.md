## Backlog

- [ ] input validation throughout the app
- [x] remove firestore dependency from home component
- [x] remove firestore dependency from create tour component
- [ ] remove firestore dependency from profile club component
- [ ] hiking clubs should only have name - there is no first name last name
- [x] fixed - mark notification as read does not work
  
### Unregistered user
- [x] registration
  - [x] save profile photo
- [x] viewing list of hiking tours
- [x] viewing one hiking tour
  - [x] show map when showing one tour
  - [ ] FIX: markers not showing on map
- [ ] viewing profiles of hiking clubs

### Registered hiking club
- [x] login logout
- [x] editing profile info
- [x] creating hiking tours
  - [x] add photos when creating tours
- [x] viewing hikers that applied for a tour
- [x] accepting or declining a tour
  - [x] send a notification to user on status change
- [x] notification on applied hiker
  - [ ] personalize the notification message

### Registered hiker
- [x] login logout
- [x] editing profile info
- [x] my tours page - user sees all tours with active applications
- [ ] viewing history of past tours that user participated in
- [ ] viewing history stats
- [ ] viewing future tours
- [ ] searching future tours
- [ ] viewing profiles of hiking clubs
- [x] apply for a tour
  - [x] disable apply button once user applies
- [x] cancel tour application
- [x] notifications on application status
- [x] grading and reviewing a tour
  - [ ] show review that user left when looking at my tours

### Database calls
- [ ] create a new user
- [ ] get user data
- [ ] update user data
- [ ] create a tour with club name and photo
- [ ] get all tours with club names and photos
- [ ] get all tours of some club
- [ ] get all applications of a tour
- [ ] create an application for a tour
- [ ] update application status and create a notification
- [ ] check if user applied for a tour & get application status
- [ ] get all accepted participants of some tour (possibly with names)
- [ ] get all tours a hiker was accepted in (with organizer names)
- [ ] get all reviews of a tour (with user names)
- [ ] get all reviews by a certain hiker
- [ ] notify when hiker applies
- [ ] notify when club accepts
- [ ] notify for tour cancellation
- [ ] get user notifications
- [ ] mark notification as read
- [ ] create a review
- [ ] get all reviews of some tour
- [ ] get all review of some user
- [ ] update user info - name or photo - this needs to update the club name accross all tours
