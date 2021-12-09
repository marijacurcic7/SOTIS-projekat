import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Take } from 'src/app/models/take.model';
import { Test } from 'src/app/models/test.model';
import { TakeService } from 'src/app/services/take.service';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-test-results',
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.css']
})
export class TestResultsComponent implements OnInit {

  test: Test
  takes: Take[]

  constructor(
    private testService: TestService,
    private takeService: TakeService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const testId = String(this.route.snapshot.paramMap.get('id'))
    this.testService.getTest(testId).subscribe(test => this.test = test)
    this.takeService.getTakesForOneTest(testId).subscribe(takes => this.takes = takes)
  }

}
