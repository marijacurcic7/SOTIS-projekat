import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AddTestComponent } from './components/teacher/add-test/add-test.component';
import { TestViewComponent } from './components/test-view/test-view.component';
import { MyTestsComponent } from './components/teacher/my-tests/my-tests.component';


const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      }, 
      {
        path: 'add-test',
        component: AddTestComponent
      },
      {
        path: 'my-tests',
        component: MyTestsComponent
      },
      {
        path: 'test-view/:id',
        component: TestViewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
