import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { MyAnswer } from 'src/app/models/myAnswer.model';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TakeService } from 'src/app/services/take.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler($event: any) {
    return false
  }

  user: User | undefined
  testId: string;
  takeId: string;
  questionId: string;
  nextQuestionId: string | undefined;
  prevQuestionId: string | undefined;
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
  multiple: boolean = true;
  

  constructor(
    private route: ActivatedRoute,
    private takeService: TakeService,
    private authService: AuthService,
    private router: Router,
  ) { 
    this.question = {
      sortedIndex: -1,
      text: "",
      maxPoints: 0,
      possibleAnswers: []
    }
    this.first = true;
    this.last = false;
    // this.questions = this.router.getCurrentNavigation()?.extras.state?.questions;
    this.questions = [];
    this.qlength = 0;
    this.qindex = 0;
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

      if(!this.user) throw new Error('You must login first.');

      // this.takeService.getTake(this.takeId, this.user.uid).subscribe(t => {
      //   this.take = t;
      // });

      this.takeService.getQuestions(this.takeId, this.user.uid).subscribe( questions => {
        this.questions = questions;
        this.questions.sort((a,b) => a.sortedIndex - b.sortedIndex);
        console.log(this.questions);
        this.qlength = this.questions.length;

        if (this.questions[0].id == this.questionId) this.first = true;
        else this.first = false;
        
        if (this.questionId == this.questions[this.questions.length-1].id) this.last = true;

        this.question = this.questions.filter(q => q.id === this.questionId)[0];
        this.qindex = this.questions.indexOf(this.question);

        if(!this.user) throw new Error('You must login first.');

        this.takeService.getMyAnswer(this.takeId, this.user.uid, this.questionId).subscribe(ma => {
          if(!ma) return
          this.myAnswer = ma;

          this.question.possibleAnswers.forEach((pa, i) => {
            if (this.myAnswer.myAnswers.includes(pa))  this.setAnswer(i);
          });

        });
      });

      

    });
  }


  async next() {
    if(!this.user) throw new Error('You must login first.');
    await this.takeService.updateMyAnswer(this.takeId, this.user.uid, this.questionId, this.myAnswer);

    var nextqindex = this.questions.indexOf(this.question) + 1;

    if(!this.questions[nextqindex].id) return;
    this.nextQuestionId = this.questions[nextqindex].id;
    // this.nextQuestionId = String(Number(this.questionId) + 1);

    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([`/take-test/${this.testId}/take/${this.takeId}/question/${this.nextQuestionId}`], {state: {questions: this.questions}});

        // this.router.navigate([`/take-test/${this.testId}/question/${this.nextQuestionId}`]);
    });
  }

  async previous() {
    if(!this.user) throw new Error('You must login first.');
    await this.takeService.updateMyAnswer(this.takeId, this.user.uid, this.questionId, this.myAnswer);

    var prevqindex = this.questions.indexOf(this.question) - 1;

    if(!this.questions[prevqindex].id) return;
    this.prevQuestionId = this.questions[prevqindex].id;
    // this.prevQuestionId = String(Number(this.questionId) - 1);

    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        // this.router.navigate([`/take-test/${this.testId}/question/${this.prevQuestionId}`]);
        this.router.navigate([`/take-test/${this.testId}/take/${this.takeId}/question/${this.prevQuestionId}`], {state: {questions: this.questions}});
    });
  }

  answer1Clicked() {
    this.a1Clicked = !this.a1Clicked;
    // if(!this.multiple && this.a1Clicked){
    //   this.a2Clicked = false;
    //   this.a3Clicked = false;
    //   this.a4Clicked = false;
    // } 
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

    await this.takeService.finishTake(this.takeId, this.user, this.testId);
    
    
    
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
