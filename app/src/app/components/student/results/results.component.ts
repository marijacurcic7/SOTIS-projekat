import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Take } from 'src/app/models/take.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TakeService } from 'src/app/services/take.service';
import { TestService } from 'src/app/services/test.service';
import firebase from 'firebase/compat/app';
import { Test } from 'src/app/models/test.model';
import { MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs/operators';
import { MyAnswer } from 'src/app/models/my-answer.model';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  user: User | undefined
  testId: string;
  takeId: string;
  take: Take;
  test: Test;
  maxPoints: number = 0;
  time: number = 0;
  dataSource: MatTableDataSource<MyAnswer>;
  displayedColumns: string[] = ['question', 'correct', 'points'];
  answers: MyAnswer[];

  
  constructor(
    private route: ActivatedRoute,
    private takeService: TakeService,
    private testService: TestService,
    private authService: AuthService,
    private router: Router,
  ) { 
    this.take = {
      passed: false,
      points: 0,
      testName: "",
      testId: "",
      startTime: firebase.firestore.Timestamp.fromDate(new Date()),
    }
    this.dataSource = new MatTableDataSource<MyAnswer>();
  }

  ngOnInit(): void {

    this.testId = String(this.route.snapshot.paramMap.get('id'));
    this.takeId = String(this.route.snapshot.paramMap.get('tid'));
    
    this.testService.getTest(this.testId).subscribe(test => {
      this.test = test;
      console.log(this.test);
      this.maxPoints = this.test.maxPoints;
    });

    this.authService.user$.subscribe(user => {
      this.user = user;
      if(!this.user) throw new Error('You are not logged in.');
      this.takeService.getTake(this.takeId, this.user?.uid).pipe(take(1)).subscribe(t => {
        this.take = t;
        console.log(this.take);
        
        if(!this.user) throw new Error('You are not logged in.');
        this.takeService.getMyAnswers(this.takeId, this.user.uid).pipe(take(1)).subscribe( ans => {
          console.log(ans);
          this.answers = ans;
          this.dataSource = new MatTableDataSource<MyAnswer>(this.answers);
          
        });
        
      });
    });
  }

}
