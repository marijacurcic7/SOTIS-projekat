import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Take } from 'src/app/models/take.model';
import { AuthService } from 'src/app/services/auth.service';
import { TakeService } from 'src/app/services/take.service';
import { TestService } from 'src/app/services/test.service';
import { Test } from 'src/app/models/test.model';
import { take } from 'rxjs/operators';
import { MyAnswer } from 'src/app/models/myAnswer.model';
import { Question } from 'src/app/models/question.model';
import { Answer } from 'src/app/models/answer.model';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  take: Take
  test: Test
  myAnswers: MyAnswer[]
  questions: Question[]
  correctAnswers: Answer[]

  constructor(
    private route: ActivatedRoute,
    private takeService: TakeService,
    private testService: TestService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    const testId = String(this.route.snapshot.paramMap.get('id'));
    const takeId = String(this.route.snapshot.paramMap.get('tid'));

    // TODO: QUERY ACTUAL QUESTIONS AND ANSWER
    const user = await this.authService.user$.pipe(take(1)).toPromise()
    if (!user) throw new Error('You are not logged in.');

    // get test
    this.testService.getTest(testId).subscribe(test => this.test = test)
    // get take
    this.takeService.getTake(takeId, user.uid).subscribe(take => this.take = take)
    // get my answers
    this.takeService.getMyAnswers(takeId, user.uid).subscribe(ans => this.myAnswers = ans)
    // get questions
    this.takeService.getQuestions(takeId, user.uid).subscribe(questions => this.questions = questions)
    // get correct answers
    this.testService.getAnswers(testId, user, takeId).subscribe(ans => this.correctAnswers = ans)
  }

  getDuration(take: Take) {
    if (!take?.endTime) return ''
    const date = new Date((take.endTime.seconds - take.startTime.seconds) * 1000);

    if ((date.getHours() - 1) > 0) return `${date.getHours() - 1}h ${date.getMinutes()}m ${date.getSeconds()}s`
    else if (date.getMinutes() > 0) return `${date.getMinutes()}m ${date.getSeconds()}s`
    else return `${date.getSeconds()}s`
  }
}
