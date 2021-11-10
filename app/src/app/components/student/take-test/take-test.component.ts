import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { AuthService } from 'src/app/services/auth.service';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-take-test',
  templateUrl: './take-test.component.html',
  styleUrls: ['./take-test.component.css']
})
export class TakeTestComponent implements OnInit {

  test: Test;
  teacherName: string;
  activeStepIndex: number;
  questions: Question[];
  answer: Answer;
  question: Question;
  qindex: number;
  last: boolean;

  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private authService: AuthService,
  ) { 
    this.test = {
      name: "",
      topic: "",
      maxPoints: 0,
      createdBy: {
        displayName: "",
        teacherId: ""
      }
    }
    this.activeStepIndex = 0;
    this.qindex = 0;
    this.last = false;
  }

  ngOnInit(): void {
    let testId = String(this.route.snapshot.paramMap.get('id'));
    console.log(testId);

    this.testService.getTest(testId).subscribe(t => {
      this.test = t;
      console.log(this.test);
      this.teacherName = this.test.createdBy.displayName;
    });

    this.testService.getQuestions(testId).subscribe(q => {
      console.log(q);
      this.questions = q;
      this.question = q[this.qindex];
    });

  }

  start() {
    this.activeStepIndex = 1;
    if(this.questions.length == this.activeStepIndex) this.last = true;
  }

  next() {
    this.activeStepIndex += 1;
    if(this.questions.length == this.activeStepIndex) this.last = true;
    this.qindex += 1;
    this.question = this.questions[this.qindex];

  }

  finish(){
    
  }

}
