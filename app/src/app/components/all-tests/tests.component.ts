import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'topic', 'points', 'teacher', 'actions'];
  tests: Test[] = [];

  constructor(
    private testService: TestService,
    private router: Router
  ) { }

  async ngOnInit() {
    (await this.testService.getTests()).subscribe(t => {
      this.tests = t;
    })

    // // if (!this.authService.user) return
    // const dummyTest: Test = {
    //   name: 'ime testa',
    //   topic: 'web programiranje',
    //   maxPoints: 3,
    //   createdBy: {
    //     displayName: "teacher name",
    //     teacherId: "teacher id"
    //     // displayName: this.authService.user.displayName,
    //     // teacherId: this.authService.user.uid
    //   },
    // }


    // this.tests.push(dummyTest);
  }

  async viewDetails(element: any) {
    console.log(element);
    const testId = 'JHNbN89t3AKdUUFx4zui';
    (await this.testService.getQuestions(testId)).subscribe(q => {
      console.log(q)
    })

    ;(await this.testService.getAnswers(testId)).subscribe(a => {
      console.log(a)
    })
    // this.router.navigate(['/test-view']);

  }

}
