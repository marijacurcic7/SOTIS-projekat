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
import { MyAnswer } from 'src/app/models/my-answer.model';
import { setupTestingRouter } from '@angular/router/testing';
import { DomainService } from 'src/app/services/domain.service';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { take } from 'rxjs/operators';


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
  sortedQuestions: Question[];
  question: Question;
  myAnswers: MyAnswer[];
  domainProblems: DomainProblem[];


  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private takeService: TakeService,
    private authService: AuthService,
    private router: Router,
    private domainService: DomainService,
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

    this.testService.getTest(this.testId).pipe(take(1)).subscribe(t => {
      this.test = t;
      console.log(this.test);
      this.teacherName = this.test.createdBy.displayName;
      if (!this.test.domain) return;
      this.domainService.getDomainProblems(String(this.test.domain)).pipe(take(1)).subscribe( async p => {
        this.domainProblems = p;
        console.log(this.domainProblems);
        await this.sortQuestions();

      })

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

    this.myAnswers = [];
    for (let index = 0; index < this.questions.length; index++) {
      let myAnswer: MyAnswer = {
        id: String(index),
        myAnswers: []
      }
      this.myAnswers.push(myAnswer);
    }

    var takeId: string;
    this.takeService.addTake(this.take, this.user.uid, this.questions, this.myAnswers).then( res => {
      takeId = res as string;
      console.log(this.questions.length);
      this.router.navigate([`/take-test/${this.testId}/take/${takeId}/question/${this.question.id}`], {state: {questions: this.sortedQuestions}});
    })
    
  }

  async sortQuestions() {
    this.sortedQuestions = [];
    var parentNodes: DomainProblem[] = [];
    parentNodes = this.domainProblems.filter( problem => !problem.input );
    console.log(parentNodes);
    parentNodes.forEach( p => {
      this.questions.forEach( q => {
        if (String(q.domainProblem) === p.id) {
          this.sortedQuestions.push(q);
        }
      });
    });

    let leveln: DomainProblem[] = [];
    leveln.push(...parentNodes);
    const rest = this.domainProblems.filter( problem => problem.input );

    rest.forEach( p => {
      if (p.input?.every( i => parentNodes.find( r => r.id == i))) {
        leveln.push(p);
        this.questions.forEach( q => {
          if (String(q.domainProblem) === p.id) {
            this.sortedQuestions.push(q);
          }
        });
      }
    });

    while (this.sortedQuestions.length < this.questions.length) {
      console.log(leveln)
      let levelnn: DomainProblem[] = [];
      console.log(this.sortedQuestions);
      rest.forEach( p => {
        if (p.input?.every( i => leveln.find( r => r.id == i))) {
          levelnn.push(p);
          this.questions.forEach( q => {
            if (String(q.domainProblem) === p.id && this.sortedQuestions.indexOf(q) == -1) {
              this.sortedQuestions.push(q);
              console.log(q);
            }
          });
        }
      });
      console.log(levelnn);
      leveln = [...new Set([...leveln,...levelnn])]
    }
    console.log(this.sortedQuestions);
    this.question = this.sortedQuestions[0];
    
  }

  

}
