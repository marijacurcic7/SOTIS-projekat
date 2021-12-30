import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import firebase from 'firebase/compat';
import { take } from 'rxjs/operators';
import { MyAnswer } from 'src/app/models/myAnswer.model';
import { Take } from 'src/app/models/take.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TakeService } from 'src/app/services/take.service';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-takes-results',
  templateUrl: './takes-results.component.html',
  styleUrls: ['./takes-results.component.css']
})
export class TakesResultsComponent implements OnInit {

  displayedColumns: string[] = ['testName', 'domain', 'points', 'duration', 'startTime', 'details'];
  takes: ExpandedTake[]
  user: User | undefined
  previousPageExists: boolean
  nextPageExists: boolean

  constructor(
    public takeService: TakeService,
    private testService: TestService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.user = await this.authService.user$.pipe(take(1)).toPromise()
    await this.getTakes()
  }

  async getTakes() {
    if (!this.user) throw new Error('You must login first.');
    let takes = await this.takeService.getTakesPage(this.user.uid, 'init');
    this.setTakes(takes)
  }

  async previous() {
    if (!this.user) throw new Error('You must login first.')
    const takes = await this.takeService.getTakesPage(this.user.uid, 'previous')
    this.setTakes(takes)

  }

  async next() {
    if (!this.user) throw new Error('You must login first.')
    const takes = await this.takeService.getTakesPage(this.user.uid, 'next');
    this.setTakes(takes)
  }

  private async setTakes(takes: Take[]) {
    this.takes = takes.map(testTake => testTake as ExpandedTake)
    // get max points & domain name for current test take
    for (const testTake of this.takes) {
      const test = await this.testService.getTest(testTake.testId).pipe(take(1)).toPromise()
      testTake.maxPoints = test.maxPoints
      testTake.domainName = test.domainName
    }
  }


  getDuration(take: ExpandedTake) {
    if (!take.endTime) return ''
    const date = new Date((take.endTime.seconds - take.startTime.seconds) * 1000);

    if ((date.getHours() - 1) > 0) return `${date.getHours() - 1}h ${date.getMinutes()}m ${date.getSeconds()}s`
    else if (date.getMinutes() > 0) return `${date.getMinutes()}m ${date.getSeconds()}s`
    else return `${date.getSeconds()}s`
  }
}

class ExpandedTake implements Take {
  user: { displayName: string; uid: string; };
  id?: string | undefined;
  passed: boolean;
  points: number;
  testName: string;
  testId: string;
  startTime: firebase.firestore.Timestamp;
  endTime?: firebase.firestore.Timestamp | undefined;
  // added fields
  myAnswers: MatTableDataSource<MyAnswer>;
  maxPoints: number;
  domainName?: string;
}