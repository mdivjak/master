import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileClubComponent } from './components/profile-club/profile-club.component';
import { ProfileHikerComponent } from './components/profile-hiker/profile-hiker.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile-club', component: ProfileClubComponent },
    { path: 'profile-hiker', component: ProfileHikerComponent }
];
