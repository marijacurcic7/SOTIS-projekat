import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { Take } from 'src/app/models/take.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TestService } from 'src/app/services/test.service';
import firebase from 'firebase/compat/app';
import { TakeService } from 'src/app/services/take.service';

@Component({
  selector: 'app-take-test',
  templateUrl: './take-test.component.html',
  styleUrls: ['./take-test.component.css']
})
export class TakeTestComponent implements OnInit {

  user: User | undefined
  testId: string;
  questionId: string | undefined;
  test: Test;
  take: Take;
  teacherName: string;
  activeStepIndex: number;
  questions: Question[];
  question: Question;


  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private takeService: TakeService,
    private authService: AuthService,
    private router: Router,
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

    
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => this.user = user);

    this.testId = String(this.route.snapshot.paramMap.get('id'));
    console.log(this.testId);

    this.testService.getTest(this.testId).subscribe(t => {
      this.test = t;
      console.log(this.test);
      this.teacherName = this.test.createdBy.displayName;
    });

    this.testService.getQuestions(this.testId).subscribe(q => {
      console.log(q);
      this.questions = q;
      this.question = q[0];
      
      this.questionId = this.question.id;
    });

  }

  start() {

    this.take = {
      passed: false,
      points: 0,
      testName: this.test.name,
      testId: this.testId,
      startTime: firebase.firestore.Timestamp.fromDate(new Date()),
    }

    if(!this.user) throw new Error('You must login first.');

    // this.takeService.addTake(this.take, this.user.uid);

    this.router.navigate([`/take-test/${this.testId}/question/${this.question.id}`]);
  }

  

}
