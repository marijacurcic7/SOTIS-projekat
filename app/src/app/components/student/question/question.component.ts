import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { MyAnswer } from 'src/app/models/my-answer.model';
import { Question } from 'src/app/models/question.model';
import { Take } from 'src/app/models/take.model';
import { Test } from 'src/app/models/test.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TakeService } from 'src/app/services/take.service';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  user: User | undefined
  testId: string;
  takeId: string;
  questionId: string;
  nextQuestionId: string;
  prevQuestionId: string;
  test: Test;
  // take: Take;
  questions: Question[];
  answer: Answer;
  myAnswer: MyAnswer;
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
  qlength: number;
  

  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private takeService: TakeService,
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
    this.questions = this.router.getCurrentNavigation()?.extras.state?.questions;
    console.log(this.questions);
    this.myAnswer = {
      myAnswers: []
    }
  }

  ngOnInit(): void {
    
    this.testId = String(this.route.snapshot.paramMap.get('id'));
    this.takeId = String(this.route.snapshot.paramMap.get('tid'));
    this.questionId = String(this.route.snapshot.paramMap.get('qid'));



    console.log("QUESTION: ", this.questionId);

    this.authService.user$.subscribe(user => {
      this.user = user;
      // console.log(this.user);

      if(!this.user) throw new Error('You must login first.');

      // this.takeService.getTake(this.takeId, this.user.uid).subscribe(t => {
      //   this.take = t;
      // });

      if (this.questionId == '0') this.first = true;
      else this.first = false;

      
      if (this.questionId == this.questions[this.questions.length-1].id) this.last = true;

      this.question = this.questions.filter(q => q.id === this.questionId)[0];

      if(!this.user) throw new Error('You must login first.');

      this.takeService.getMyAnswer(this.takeId, this.user.uid, this.questionId).subscribe(ma => {
        if(!ma) return
        this.myAnswer = ma;

        this.question.possibleAnswers.forEach((pa, i) => {
          if (this.myAnswer.myAnswers.includes(pa))  this.setAnswer(i);
        });

      });

    });
  }


  next() {
    if(!this.user) throw new Error('You must login first.');
    this.takeService.updateMyAnswer(this.takeId, this.user.uid, this.questionId, this.myAnswer);

    this.nextQuestionId = String(Number(this.questionId) + 1);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([`/take-test/${this.testId}/take/${this.takeId}/question/${this.nextQuestionId}`], {state: {questions: this.questions}});

        // this.router.navigate([`/take-test/${this.testId}/question/${this.nextQuestionId}`]);
    });
  }

  previous() {
    if(!this.user) throw new Error('You must login first.');
    this.takeService.updateMyAnswer(this.takeId, this.user.uid, this.questionId, this.myAnswer);

    this.prevQuestionId = String(Number(this.questionId) - 1);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        // this.router.navigate([`/take-test/${this.testId}/question/${this.prevQuestionId}`]);
        this.router.navigate([`/take-test/${this.testId}/take/${this.takeId}/question/${this.prevQuestionId}`], {state: {questions: this.questions}});
    });
  }

  answer1Clicked() {
    this.a1Clicked = !this.a1Clicked;
    var text = this.question.possibleAnswers[0];
    if (this.a1Clicked) {
      this.myAnswer.myAnswers.push(text);
      // console.log(text);
    }
    else this.removeAnswer(text);
    // console.log(this.myAnswer.myAnswers);
  }

  answer2Clicked() {
    this.a2Clicked = !this.a2Clicked;
    var text = this.question.possibleAnswers[1];
    if (this.a2Clicked) {
      this.myAnswer.myAnswers.push(text);
    } 
    else this.removeAnswer(text);
  }

  answer3Clicked() {
    this.a3Clicked = !this.a3Clicked;
    var text = this.question.possibleAnswers[2];
    if (this.a3Clicked){
      this.myAnswer.myAnswers.push(text);
    } 
    else this.removeAnswer(text);
  }

  answer4Clicked() {
    this.a4Clicked = !this.a4Clicked;
    var text = this.question.possibleAnswers[3];
    if (this.a4Clicked) {
      this.myAnswer.myAnswers.push(text);
    } 
    else this.removeAnswer(text);
  }

  async finish() {
    if(!this.user) throw new Error('You must login first.');
    await this.takeService.updateMyAnswer(this.takeId, this.user.uid, this.questionId, this.myAnswer);

    await this.takeService.finishTake(this.takeId, this.user.uid, this.testId);

    this.router.navigate([`/take-test/${this.testId}`]);
  }

  removeAnswer(element: string) {
    // console.log(element);
    this.myAnswer.myAnswers.forEach((value,index)=>{
        if(value==element) this.myAnswer.myAnswers.splice(index,1);
    });
  }

  setAnswer (i: number){
    // console.log(i);
    switch(i) { 
      case 0: { 
        this.a1Clicked = true;
        break; 
      } 
      case 1: { 
        this.a2Clicked = true;
        break; 
      } 
      case 2: { 
        this.a3Clicked = true;
        break; 
      } 
      case 3: { 
        this.a4Clicked = true;
        break; 
      } 
      default: { 
         break; 
      } 
   } 
  }

}
