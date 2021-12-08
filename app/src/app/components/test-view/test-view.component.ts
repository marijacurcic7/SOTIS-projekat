import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-test-view',
  templateUrl: './test-view.component.html',
  styleUrls: ['./test-view.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TestViewComponent implements OnInit {

  test: Test;
  teacherName: string;
  domainId: string = "";
  questions: Question[];
  answer: Answer;
  displayedColumns: string[] = ['text', 'points'];
  innerDisplayedColumns = ['answer', 'correct'];
  expandedElement: Question | null;
  expandedElements: Question[];
  edit: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
  ) {
    this.test = {
      name: "",
      maxPoints: 0,
      createdBy: {
        displayName: "",
        teacherId: ""
      }
    }
    this.answer = {
      correctAnswers: []
    }
    this.expandedElements = [];

  }

  ngOnInit() {
    let testId = String(this.route.snapshot.paramMap.get('id'));
    console.log(testId);

    this.testService.getTest(testId).subscribe(t => {
      this.test = t;
      this.domainId = this.test.domainId? this.test.domainId : "";
      console.log(this.test);
      this.teacherName = this.test.createdBy.displayName;
    });

    this.testService.getQuestions(testId).subscribe(q => {
      console.log(q);
      this.questions = q;
    });

  }

  toggleRow(q: Question) {

    let id = String(this.route.snapshot.paramMap.get('id'));
    if (!q.id) return;

    this.testService.getAnswer(id, q.id).subscribe(a => {
      this.answer = a;
    });

    let i = this.expandedElements.indexOf(q);
    if(i > -1) this.expandedElements.splice(i);
    else this.expandedElements.push(q);

    // q.possibleAnswers && q.possibleAnswers.length ? (this.expandedElement = this.expandedElement === q ? null : q) : null;
    this.cd.detectChanges();

  }

  correct(q: Question, a: string) {

    let id = String(this.route.snapshot.paramMap.get('id'));
    if (!q.id) return;

    //this.testService.getAnswer(id, q.id).subscribe(ans => {
    //   this.answer = ans;
    for (var val of this.answer.correctAnswers) {
      if (a == val) return true;
    }
    return false;
    // });


  }


}
