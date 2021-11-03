import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';

export interface AnswerData {
  text: string;
  correct: boolean;
}

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
  questions: Question[];
  answer: Answer;
  displayedColumns: string[] = ['text', 'points'];
  innerDisplayedColumns = ['answer', 'correct'];
  expandedElement: Question | null;


  constructor(    
    private route: ActivatedRoute,
    private testService: TestService,
    private cd: ChangeDetectorRef
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
    this.answer = {
      correctAnswers: []
    }

  }

  async ngOnInit(): Promise<void> {
    let id = String(this.route.snapshot.paramMap.get('id'));
    console.log(id);

    (await this.testService.getTest(id)).subscribe(t => {
      this.test = t;
      console.log(this.test);
      this.teacherName = this.test.createdBy.displayName;
    });

    (await this.testService.getQuestions(id)).subscribe(q => {
      console.log(q);
      this.questions = q;
    });

  }

  async toggleRow(q: Question) {

    let id = String(this.route.snapshot.paramMap.get('id'));
    if (!q.id) return;

    (await this.testService.getAnswer(id, q.id)).subscribe(a => {
      this.answer = a;
    });

    
    q.possibleAnswers && q.possibleAnswers.length ? (this.expandedElement = this.expandedElement === q ? null : q) : null;
    this.cd.detectChanges();
  
  }

  correct(q: Question, a: string){

    let id = String(this.route.snapshot.paramMap.get('id'));
    if (!q.id) return;

    // (await this.testService.getAnswer(id, q.id)).subscribe(ans => {
    //   this.answer = ans;
      for (var val of this.answer.correctAnswers){
        if(a == val) return true;
      }
      return false;
    // });

    
  }


}
