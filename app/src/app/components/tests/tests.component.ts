import { Component, OnInit } from '@angular/core';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'topic', 'points', 'teacher'];
  tests: Test[] = [];

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {

    // if (!this.authService.user) return
    const dummyTest: Test = {
      name: 'ime testa',
      topic: 'web programiranje',
      maxPoints: 3,
      createdBy: {
        displayName: "teacher name",
        teacherId: "teacher id"
        // displayName: this.authService.user.displayName,
        // teacherId: this.authService.user.uid
      },
    }
    

    this.tests.push(dummyTest);
  }

  viewQuestions(element: any){

  }

}
