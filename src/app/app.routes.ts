import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegisterComponent } from './register/register.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { CollectionsComponent } from './collections/collections.component';
import { CreateCollectionComponent } from './create-collection/create-collection.component';
import { DocumentsComponent } from './documents/documents.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { authGuard } from './guards/auth.guard';
import { rootGuard } from './guards/root.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [rootGuard],
    children: []
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'activate-account',
    component: ActivateAccountComponent
  },
  {
    path: 'collections',
    component: CollectionsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'collections/create',
    component: CreateCollectionComponent,
    canActivate: [authGuard]
  },
  {
    path: 'collections/:collectionName/documents',
    component: DocumentsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'collections/:collectionName/documents/create',
    component: DocumentFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'collections/:collectionName/documents/:documentId/edit',
    component: DocumentFormComponent,
    canActivate: [authGuard]
  }
];
