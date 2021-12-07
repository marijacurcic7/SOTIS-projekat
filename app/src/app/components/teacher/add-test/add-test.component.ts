import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Answer } from 'src/app/models/answer.model';
import { Question } from "../../../models/question.model"
import { Test } from "../../../models/test.model"
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TestService } from 'src/app/services/test.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { DomainService } from 'src/app/services/domain.service';
import { Domain } from 'src/app/models/domain.model';

export interface DialogData {
  domainId: any;
  testId: string;
  problemName: string;
  ques: Question;
  ans: Answer;
  text: string;
  maxPoints: number;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  a1check: boolean;
  a2check: boolean;
  a3check: boolean;
  a4check: boolean;
}

export interface QuestionData {
  text: string;
  maxPoints: number;
  possibleAnswers: string[];
  trueAnswers: string[];
}


@Component({
  selector: 'app-add-test',
  templateUrl: './add-test.component.html',
  styleUrls: ['./add-test.component.css']
})
export class AddTestComponent implements OnInit {
  // @Output() messageEvent = new EventEmitter<string>();
  user: User | undefined
  testForm!: FormGroup;
  test!: Test;
  maxPoints: number = 0;
  name: string;
  topic: string;
  questions: Question[];
  answers: Answer[];
  displayedColumns: string[] = ['text', 'points'];
  dataSource: MatTableDataSource<Question>;
  submitionError: boolean = false;
  domains: Domain[];
  domain: Domain;
  domainId: string = "";
  graphVisible: boolean = false;
  domainProblem: DomainProblem;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private testService: TestService,
    private authService: AuthService,
    private router: Router,
    private domainService: DomainService
  ) {
    this.questions = [];
    this.answers = [];
    this.dataSource = new MatTableDataSource<Question>();
    this.maxPoints = 0;
    this.testForm = this.fb.group({
      'name': [''],
      'topic': [''],
      'selectedDomain': [''],
      'maxPoints': [''],
    });
  }

  addQuestion(): void {
    // var domainId = this.testForm.controls['selectedDomain'].value;
    var problemName = this.domainProblem.label;
    const dialogRef = this.dialog.open(QuestionDialog, {
      width: '800px',
      data: { problemName },
    });

    dialogRef.afterClosed().subscribe(result => {
      let randomStr = (Math.random() + 1).toString(36).substring(7);
      if (result) {

        let q: Question = {
          sortedIndex: -1,
          id: randomStr,
          text: result.text,
          maxPoints: result.maxPoints,
          domainProblemId: this.domainProblem.id,
          domainProblemName: this.domainProblem.label,
          possibleAnswers: result.possibleAnswers,
        }
        this.maxPoints += result.maxPoints;
        console.log(q);
        this.questions = [...this.questions, q];
        console.log(this.questions);

        let a: Answer = {
          id: randomStr,
          correctAnswers: result.trueAnswers
        }
        this.answers = [...this.answers, a];
        console.log(this.answers);
        this.dataSource = new MatTableDataSource<Question>(this.questions);
      }

    });
  }


  editQuestion(ques: Question, ans: Answer): void {
    // var domainId = this.testForm.controls['selectedDomain'].value;
    var problemName = ques.domainProblemName;
    const dialogRef = this.dialog.open(QuestionDialog, {
      width: '800px',
      data: { problemName, ques, ans },
    });
    

    dialogRef.afterClosed().subscribe(result => {
      // const randomStr = (Math.random() + 1).toString(36).substring(7);
      if (result) {

        let q: Question = {
          sortedIndex: -1,
          id: ques.id,
          text: result.text,
          maxPoints: result.maxPoints,
          domainProblemId: ques.domainProblemId,
          domainProblemName: ques.domainProblemName,
          possibleAnswers: result.possibleAnswers,
        }
        this.maxPoints -= ques.maxPoints;
        this.maxPoints += result.maxPoints;
        console.log(q);

        // let updateQ = this.questions.filter(item => item.id == q.id)[0];
        // let qindex = this.questions.indexOf(updateQ);
        // this.questions[qindex] = q;
        this.questions.forEach((value,index)=>{
          if(value==ques) this.questions.splice(index,1);
        });
        console.log(this.questions);
        this.questions = [...this.questions, q];
        console.log(this.questions);

        let a: Answer = {
          id: ans.id,
          correctAnswers: result.trueAnswers
        }
        let updateA = this.answers.filter(item => item.id == a.id)[0];
        let aindex = this.answers.indexOf(updateA);
        this.answers[aindex] = a;
        console.log(this.answers);

        this.dataSource = new MatTableDataSource<Question>(this.questions);
      }

    });
  }

  ngOnInit(): void {

    this.authService.user$.subscribe(user => this.user = user);
    this.domainService.getDomains().subscribe(d => {
      this.domains = d;
    });

  }

  async saveTest() {

    this.name = this.testForm.controls['name'].value;
    this.topic = this.testForm.controls['topic'].value;
    this.domain = this.testForm.controls['selectedDomain'].value;
    // console.log(this.domain);

    if (!this.user) throw new Error('You must login first.')

    this.test = {
      name: this.name,
      domainId: this.domain.id,
      domainName: this.domain.name,
      maxPoints: this.maxPoints,
      createdBy: {
        displayName: this.user.displayName,
        teacherId: this.user.uid
      }
    }

    console.log(this.test);
    console.log(this.questions);
    // console.log(this.answers);

    try {
      // await this.testService.addTest(dummyTest, dummyQuestions, dummyAnswers);
      await this.testService.addTest(this.test, this.questions, this.answers);
      this.router.navigate(['/'])
    } catch (error) {
      console.log(error);
      this.submitionError = true;
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }

  onDomainChange(domainId: any) {
    this.graphVisible = false;
    this.domainId = this.testForm.controls['selectedDomain'].value.id;
    // this.messageEvent.emit(this.message);
    console.log(this.domainId);
    this.graphVisible = true;
  }

  onNodeClick(problem: any){
    console.log(problem);

    if (problem.type === 'questionNode') {
      console.log("izmeni pitanje");
      let q = this.questions.filter( qq => qq.id == problem.id)[0];
      console.log(q);
      let a = this.answers.filter( aa => aa.id == problem.id)[0];
      console.log(a);
      this.editQuestion(q, a);
    }
    else {
      this.domainProblem = problem;
      this.addQuestion();
    }
    
  }

}


@Component({
  selector: 'question-dialog',
  templateUrl: 'question-dialog.html',
  styleUrls: ['./add-test.component.css']
})
export class QuestionDialog {

  a1check = false;
  a2check = false;
  a3check = false;
  a4check = false;
  a3visible: boolean = false;
  a4visible: boolean = false;
  questionForm!: FormGroup;

  domainProblems: DomainProblem[];

  constructor(
    public dialogRef: MatDialogRef<QuestionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private authService: AuthService,
    private domainService: DomainService,
    private testService: TestService,
  ) {
    this.questionForm = this.fb.group({
      'text': [''],
      'maxPoints': [''],
      'selectedDomainProblem': [''],
      'a1': [''],
      'a2': [''],
      'a3': [''],
      'a4': [''],
      'a1check': [''],
      'a2check': [''],
      'a3check': [''],
      'a4check': ['']
    });
  }

  ngOnInit(): void {
    console.log(this.data.ans);
    if(this.data.ques && this.data.ans){
      this.questionForm.controls['text'].setValue(this.data.ques.text);
      this.questionForm.controls['maxPoints'].setValue(this.data.ques.maxPoints);
      let a1 = this.data.ques.possibleAnswers[0];
      let a2 = this.data.ques.possibleAnswers[1];
      let a3 = this.data.ques.possibleAnswers[2];
      let a4 = this.data.ques.possibleAnswers[3];
      if(a3) this.a3visible = true;
      if(a4) this.a4visible = true;
      this.questionForm.controls['a1'].setValue(a1);
      this.questionForm.controls['a2'].setValue(a2);
      this.questionForm.controls['a3'].setValue(a3);
      this.questionForm.controls['a4'].setValue(a4);
      this.questionForm.controls['a1check'].setValue(this.data.ans.correctAnswers.includes(a1));
      this.questionForm.controls['a2check'].setValue(this.data.ans.correctAnswers.includes(a2));
      this.questionForm.controls['a3check'].setValue(this.data.ans.correctAnswers.includes(a3));
      this.questionForm.controls['a4check'].setValue(this.data.ans.correctAnswers.includes(a4));
      this.a1check = this.data.ans.correctAnswers.includes(a1);
      this.a2check = this.data.ans.correctAnswers.includes(a2);
      this.a3check = this.data.ans.correctAnswers.includes(a3);
      this.a4check = this.data.ans.correctAnswers.includes(a4);
    }

  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDone(): void {

    let question1: QuestionData = {
      text: this.questionForm.controls['text'].value,
      maxPoints: Number(this.questionForm.controls['maxPoints'].value),
      possibleAnswers: [],
      trueAnswers: []
    }

    let answer1 = this.questionForm.controls['a1'].value;
    let answer2 = this.questionForm.controls['a2'].value;
    let answer3 = this.questionForm.controls['a3'].value;
    let answer4 = this.questionForm.controls['a4'].value;

    this.a1check = this.questionForm.controls['a1check'].value;
    this.a2check = this.questionForm.controls['a2check'].value;
    this.a3check = this.questionForm.controls['a3check'].value;
    this.a4check = this.questionForm.controls['a4check'].value;

    if (answer1) {
      question1.possibleAnswers.push(answer1)
      if (this.a1check) {
        question1.trueAnswers.push(answer1)
      }
    }
    if (answer2) {
      question1.possibleAnswers.push(answer2)
      if (this.a2check) {
        question1.trueAnswers.push(answer2)
      }
    }
    if (answer3) {
      question1.possibleAnswers.push(answer3)
      if (this.a3check) {
        question1.trueAnswers.push(answer3)
      }
    }
    if (answer4) {
      question1.possibleAnswers.push(answer4)
      if (this.a4check) {
        question1.trueAnswers.push(answer4)
      }
    }

    this.dialogRef.close(question1);
  }

  addA3() {
    this.a3visible = true;
  }

  addA4() {
    this.a4visible = true;
  }

  deleteA3() {
    this.a3visible = false;
    this.a3check = false;
  }

  deleteA4() {
    this.a4visible = false;
    this.a4check = false;
  }
}


