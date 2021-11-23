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
  domainProblem: DomainProblem;
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

  questionDialog(): void {
    var domainId = this.testForm.controls['selectedDomain'].value;
    const dialogRef = this.dialog.open(QuestionDialog, {
      width: '800px',
      data: { domainId },
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      // console.log(result);
      if (result) {

        let q: Question = {
          text: result.text,
          maxPoints: result.maxPoints,
          domainProblem: result.domainProblem,
          possibleAnswers: result.possibleAnswers,
        }
        this.maxPoints += result.maxPoints;
        console.log(q);
        this.questions.push(q);

        let a: Answer = {
          correctAnswers: result.trueAnswers
        }
        this.answers.push(a);
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

    if(!this.user) throw new Error('You must login first.')

    this.test = {
      name: this.name,
      topic: this.topic,
      domain: this.domain,
      maxPoints: this.maxPoints,
      createdBy: {
        displayName: this.user.displayName,
        teacherId: this.user.uid
      }
    }

    // console.log(this.test);
    // console.log(this.questions);
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
    private domainService: DomainService
  ) 
  { 
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

    console.log(this.data.domainId);
    this.domainService.getDomainProblems(this.data.domainId).subscribe( problems => {
      this.domainProblems = problems;
    });

  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDone(): void {

    let question1: QuestionData = {
      text: this.questionForm.controls['text'].value,
      domainProblem: this.questionForm.controls['selectedDomainProblem'].value,
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

  addA3(){
    this.a3visible = true;
  }

  addA4(){
    this.a4visible = true;
  }

  deleteA3(){
    this.a3visible = false;
    this.a3check = false;
  }

  deleteA4(){
    this.a4visible = false;
    this.a4check = false;
  }

  // onChange() {
  //   var domainId = this.questionForm.controls['selectedDomain'].value;
  //   this.domainService.getDomainProblems(domainId).subscribe( problems => {
  //     this.domainProblems = problems;
  //   })

  // }
}


