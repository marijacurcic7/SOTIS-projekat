import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AddTestComponent } from './components/teacher/add-test/add-test.component';
import { TestViewComponent } from './components/teacher/test-view/test-view.component';
import { MyTestsComponent } from './components/teacher/my-tests/my-tests.component';
import { RoleGuard } from './guards/role.guard';
import { AllTestsComponent } from './components/student/all-tests/all-tests.component';
import { TakeTestComponent } from './components/student/take-test/take-test.component';
import { QuestionComponent } from './components/student/question/question.component';
import { ResultsComponent } from './components/student/results/results.component';
import { GraphEditorComponent } from './components/teacher/graph-editor/graph-editor.component';
import { DomainsComponent } from './components/teacher/domains/domains.component';
import { TestResultsComponent } from './components/teacher/test-results/test-results.component';
import { TakesResultsComponent } from './components/student/takes-results/takes-results.component';

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
      // teacher
      {
        path: 'add-test',
        component: AddTestComponent,
        data: { roles: ['teacher'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'my-tests',
        component: MyTestsComponent,
        data: { roles: ['teacher'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'test-view/:id',
        component: TestViewComponent,
        data: { roles: ['teacher'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'test-results/:id',
        component: TestResultsComponent,
        data: { roles: ['teacher'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'domains',
        component: DomainsComponent,
        data: { roles: ['teacher'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'graph-editor/:domainId',
        component: GraphEditorComponent,
        data: { roles: ['teacher'] },
        canActivate: [RoleGuard]
      },

      // student
      {
        path: 'all-tests',
        component: AllTestsComponent,
        data: { roles: ['student'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'take-test/:id',
        component: TakeTestComponent,
        data: { roles: ['student'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'take-test/:id/take/:tid/question/:qid',
        component: QuestionComponent,
        data: { roles: ['student'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'take-test/:id/take/:tid/results',
        component: ResultsComponent,
        data: { roles: ['student'] },
        canActivate: [RoleGuard]
      },
      {
        path: 'takes-results',
        component: TakesResultsComponent,
        data: { roles: ['student'] },
        canActivate: [RoleGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
