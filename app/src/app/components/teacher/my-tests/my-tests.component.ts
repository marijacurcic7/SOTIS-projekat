import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-my-tests',
  templateUrl: './my-tests.component.html',
  styleUrls: ['./my-tests.component.css']
})
export class MyTestsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'topic', 'points', 'teacher', 'actions'];
  tests: Test[] = [];

  constructor(
    private testService: TestService,
    private router: Router
  ) { }

  ngOnInit() {
    this.testService.getTests('0Qecl1gUb2ORbU0vKOQYRSWy8xC8').subscribe(t => {
      this.tests = t;
    })
  }

  viewDetails(element: any) {
    console.log(element);
    const testId = 'JHNbN89t3AKdUUFx4zui';
    this.testService.getQuestions(testId).subscribe(q => {
      console.log(q)
    })

    this.testService.getAnswers(testId).subscribe(a => {
      console.log(a)
    })
    // this.router.navigate(['/test-view']);

  }
}
