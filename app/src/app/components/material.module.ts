import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { TeacherHomePageComponent } from './teacher/teacher-home-page/teacher-home-page.component';
import { AddTestComponent, QuestionDialog } from './teacher/add-test/add-test.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { TestViewComponent } from './test-view/test-view.component';
import { MyTestsComponent } from './teacher/my-tests/my-tests.component';
import {MatDividerModule} from '@angular/material/divider';
import { AllTestsComponent } from './all-tests/all-tests.component';
import { TakeTestComponent } from './student/take-test/take-test.component';
import { StudentHomePageComponent } from './student/student-home-page/student-home-page.component';
import { QuestionComponent } from './student/question/question.component';
import { ResultsComponent } from './student/results/results.component';
import { GraphEditorComponent } from './teacher/graph-editor/graph-editor.component';
import { EditNodeDialogComponent } from './teacher/graph-editor/edit-node-dialog/edit-node-dialog.component';
import { DomainsComponent } from './teacher/domains/domains.component';
import { AddDomainComponent } from './teacher/domains/add-domain/add-domain.component';
import { EditDomainComponent } from './teacher/domains/edit-domain/edit-domain.component';
import { DeleteDomainComponent } from './teacher/domains/delete-domain/delete-domain.component';
import { RealDomainComponent } from './teacher/real-domain/real-domain.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    HomePageComponent,
    LoginComponent,
    SignupComponent,
    TeacherHomePageComponent,
    AddTestComponent,
    QuestionDialog,
    TestViewComponent,
    MyTestsComponent,
    AllTestsComponent,
    TakeTestComponent,
    StudentHomePageComponent,
    QuestionComponent,
    ResultsComponent,
    GraphEditorComponent,
    EditNodeDialogComponent,
    DomainsComponent,
    AddDomainComponent,
    EditDomainComponent,
    DeleteDomainComponent,
    RealDomainComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatRadioModule,
    MatTableModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ]
})
export class MaterialModule { }
