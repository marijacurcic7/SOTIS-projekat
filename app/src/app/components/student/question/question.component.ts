import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { AuthService } from 'src/app/services/auth.service';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {

  testId: string;
  questionId: string;
  nextQuestionId: string;
  prevQuestionId: string;
  test: Test;
  questions: Question[];
  answer: Answer;
  question: Question;
  qindex: number;
  first: boolean;
  last: boolean;
  a1Clicked: boolean = false;
  a2Clicked: boolean = false;
  a3Clicked: boolean = false;
  a4Clicked: boolean = false;
  newColor = false;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  

  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private authService: AuthService,
    private router: Router,
  ) { 
    this.question = {
      text: "",
      maxPoints: 0,
      possibleAnswers: []
    }
    this.qindex = 0;
    this.first = true;
    this.last = false;
  }

  ngOnInit(): void {
    this.testId = String(this.route.snapshot.paramMap.get('id'));

    this.questionId = String(this.route.snapshot.paramMap.get('qid'));

    this.testService.getQuestions(this.testId).subscribe(qs => {
      this.questions = qs;
      this.testService.getQuestion(this.testId, this.questionId).subscribe(q => {
        this.question = q;
        if (this.questionId == '0') this.first = true;
        else this.first = false;
        if (this.question.id == this.questions[this.questions.length-1].id) this.last = true;
      });
      
      
    });

  }


  next() {
    //TODO: save answer
    this.nextQuestionId = String(Number(this.questionId) + 1);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([`/take-test/${this.testId}/question/${this.nextQuestionId}`]);
    });
  }

  previous() {
    this.prevQuestionId = String(Number(this.questionId) - 1);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([`/take-test/${this.testId}/question/${this.prevQuestionId}`]);
    });
  }

  answer1Clicked() {
    this.a1Clicked = !this.a1Clicked;
  }

  answer2Clicked() {
    this.a2Clicked = !this.a2Clicked;
  }

  answer3Clicked() {
    this.a3Clicked = !this.a3Clicked;
  }

  answer4Clicked() {
    this.a4Clicked = !this.a4Clicked;
  }

  finish() {
    this.router.navigate([`/take-test/${this.testId}`]);
  }

}
