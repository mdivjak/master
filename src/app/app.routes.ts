import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileClubComponent } from './components/profile-club/profile-club.component';
import { ProfileHikerComponent } from './components/profile-hiker/profile-hiker.component';
import { authGuard } from './guards/auth.guard';
import { CreateHikingTourComponent } from './components/create-hiking-tour/create-hiking-tour.component';
import { hikingClubGuard } from './guards/hiking-club.guard';
import { TourDetailsComponent } from './components/tour-details/tour-details.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile-club', component: ProfileClubComponent, canActivate: [authGuard] },
    { path: 'profile-hiker', component: ProfileHikerComponent, canActivate: [authGuard] },
    { path: 'create-hiking-tour', component: CreateHikingTourComponent, canActivate: [hikingClubGuard] },
    { path: 'tour-details/:id', component: TourDetailsComponent },
];
