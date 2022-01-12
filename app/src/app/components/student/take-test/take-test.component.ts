import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { Take } from 'src/app/models/take.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TestService } from 'src/app/services/test.service';
import firebase from 'firebase/compat/app';
import { TakeService } from 'src/app/services/take.service';
import { MyAnswer } from 'src/app/models/myAnswer.model';
import { DomainService } from 'src/app/services/domain.service';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-take-test',
  templateUrl: './take-test.component.html',
  styleUrls: ['./take-test.component.css']
})
export class TakeTestComponent implements OnInit {

  status: undefined | 'saving'
  user: User | undefined
  testId: string;
  questionId: string | undefined;
  test: Test;
  activeStepIndex: number;
  questions: Question[];
  sortedQuestions: Question[];
  question: Question;
  domainProblems: DomainProblem[];


  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private takeService: TakeService,
    private authService: AuthService,
    private router: Router,
    private domainService: DomainService,
  ) { }

  async ngOnInit() {
    // get user
    this.authService.user$.subscribe(user => this.user = user);
    // get test id
    this.testId = String(this.route.snapshot.paramMap.get('id'));

    // get test
    this.test = await this.testService.getTest(this.testId).pipe(take(1)).toPromise()
    if (!this.test.domainId) throw new Error('test is missing ID.');

    // get domain problems
    // load active domain
    // active domain could be expected domain or real domain
    // if no active domain is defined, use expected domain by default
    const domain = await this.domainService.getDomain(this.test.domainId).pipe(take(1)).toPromise()
    if (domain?.currentlyActive === 'realDomain') {
      this.domainProblems = await this.domainService.getRealDomainProblems(this.test.domainId).pipe(take(1)).toPromise()
    }
    else {
      this.domainProblems = await this.domainService.getDomainProblems(this.test.domainId).pipe(take(1)).toPromise()
    }

    // get questions
    this.questions = await this.testService.getQuestions(this.testId).pipe(take(1)).toPromise()

    // sort questions based on domain problems intput[] & output[]
    await this.sortQuestions();

  }

  start() {
    this.status = 'saving'
    if (!this.user) throw new Error('You must login first.');
    
    const myAnswers: MyAnswer[] = this.questions.map((_, index) => {
      return {
        id: String(index),
        myAnswers: [],
        correct: false,
        points: 0
      }
    })

    const take: Take = {
      passed: false,
      points: 0,
      testName: this.test.name,
      testId: this.testId,
      startTime: firebase.firestore.Timestamp.fromDate(new Date()),
      user: { displayName: this.user.displayName, uid: this.user.uid }
    }
    this.takeService.addTake(take, this.user.uid, this.sortedQuestions, myAnswers).then(takeId => {
      this.router.navigate([`/take-test/${this.testId}/take/${takeId}/question/${this.question.id}`], { state: { questions: this.sortedQuestions } });
    })

  }

  async sortQuestions() {
    this.sortedQuestions = [];
    var parentNodes: DomainProblem[] = [];
    parentNodes = this.domainProblems.filter(problem => !problem.input);

    parentNodes.forEach(p => {
      this.questions.forEach(q => {
        if (q.domainProblemId === p.id) {
          this.sortedQuestions.push(q);
        }
      });
    });

    let leveln: DomainProblem[] = [];
    leveln.push(...parentNodes);
    const rest = this.domainProblems.filter(problem => problem.input);

    rest.forEach(p => {
      if (p.input?.every(i => parentNodes.find(r => r.id == i))) {
        leveln.push(p);
        this.questions.forEach(q => {
          if (q.domainProblemId === p.id) {
            this.sortedQuestions.push(q);
          }
        });
      }
    });

    while (this.sortedQuestions.length < this.questions.length) {
      // console.log(leveln)
      let levelnn: DomainProblem[] = [];
      rest.forEach(p => {
        if (p.input?.every(i => leveln.find(r => r.id == i))) {
          levelnn.push(p);
          this.questions.forEach(q => {
            if (q.domainProblemId === p.id && this.sortedQuestions.indexOf(q) == -1) {
              this.sortedQuestions.push(q);
            }
          });
        }
      });
      // console.log(levelnn);
      leveln = [...new Set([...leveln, ...levelnn])]
    }
    for (let index = 0; index < this.sortedQuestions.length; index++) {
      this.sortedQuestions[index].sortedIndex = index;
    }
    console.log(this.sortedQuestions);
    this.question = this.sortedQuestions[0];

  }



}
