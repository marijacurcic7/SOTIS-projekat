import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import firebase from 'firebase/compat';
import { take } from 'rxjs/operators';
import { MyAnswer } from 'src/app/models/myAnswer.model';
import { Take } from 'src/app/models/take.model';
import { Test } from 'src/app/models/test.model';
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

  dataSource = new MatTableDataSource<MyAnswer>()
  displayedColumns: string[] = ['question', 'correct', 'points']
  takes: ExpandedTake[]
  tests: Test[] = []

  constructor(
    private takeService: TakeService,
    private testService: TestService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    const user = await this.authService.user$.pipe(take(1)).toPromise()
    if (!user) throw new Error('You must login first.');

    const takes = await this.takeService.getAllTakes(user.uid).pipe(take(1)).toPromise()
    this.takes = takes.map(testTake => testTake as ExpandedTake)

    for (const testTake of this.takes) {
      // get answers for current test take
      if (!testTake.id) continue
      testTake.myAnswers = new MatTableDataSource<MyAnswer>(
        await this.takeService
          .getMyAnswers(testTake.id, user.uid)
          .pipe(take(1))
          .toPromise()
      )

      // get max points & domain name for current test take
      const test = await this.testService.getTest(testTake.testId).pipe(take(1)).toPromise()
      testTake.maxPoints = test.maxPoints
      testTake.domainName = test.domainName
    }
  }

  getDuration(take: ExpandedTake) {
    if (!take.endTime) return ''
    const end = take.endTime.toDate()
    const start = take.startTime.toDate()

    const diff = Math.floor((end.valueOf() - start.valueOf()) / 1000)
    return diff



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