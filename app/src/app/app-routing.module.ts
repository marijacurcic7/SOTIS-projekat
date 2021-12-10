import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AddTestComponent } from './components/teacher/add-test/add-test.component';
import { TestViewComponent } from './components/teacher/test-view/test-view.component';
import { MyTestsComponent } from './components/teacher/my-tests/my-tests.component';
import { RoleGuard } from './guards/role.guard';
import { AllTestsComponent } from './components/all-tests/all-tests.component';
import { TakeTestComponent } from './components/student/take-test/take-test.component';
import { QuestionComponent } from './components/student/question/question.component';
import { ResultsComponent } from './components/student/results/results.component';
import { GraphEditorComponent } from './components/teacher/graph-editor/graph-editor.component';
import { DomainsComponent } from './components/teacher/domains/domains.component';
import { TestResultsComponent } from './components/teacher/test-results/test-results.component';

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
        path: 'all-tests',
        component: AllTestsComponent
      },
      {
        path: 'take-test/:id',
        component: TakeTestComponent,
      },
      {
        path: 'take-test/:id/take/:tid/question/:qid',
        component: QuestionComponent
      },
      {
        path: 'take-test/:id/take/:tid/results',
        component: ResultsComponent
      },
      {
        path: 'domains',
        component: DomainsComponent
      },
      {
        path: 'graph-editor/:domainId',
        component: GraphEditorComponent
      },
      {
        path: 'test-results/:id',
        component: TestResultsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
