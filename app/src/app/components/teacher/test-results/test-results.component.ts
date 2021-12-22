import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Domain } from 'src/app/models/domain.model';
import { Take } from 'src/app/models/take.model';
import { Test } from 'src/app/models/test.model';
import { DomainService } from 'src/app/services/domain.service';
import { TakeService } from 'src/app/services/take.service';
import { TestService } from 'src/app/services/test.service';


@Component({
  selector: 'app-test-results',
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.css'],
})
export class TestResultsComponent implements OnInit {

  test: Test;
  takes: Take[];
  domain: Domain;
  currentlyActive: 'realDomain' | 'expectedDomain' | undefined;
  
  constructor(
    private testService: TestService,
    private takeService: TakeService,
    private domainService: DomainService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const testId = String(this.route.snapshot.paramMap.get('id'))
    this.takeService.getTakesForOneTest(testId).subscribe(takes => {
      this.takes = takes;
    });
    this.testService.getTest(testId).subscribe(test => {
      this.test = test
      if (test.domainId) this.domainService.getDomain(test.domainId).subscribe(domain => { 
        if (domain){
         this.domain = domain 
         this.currentlyActive = domain.currentlyActive ? domain.currentlyActive : 'expectedDomain'
         this.domain.id = test.domainId
        }  
      })
    })
  }
  
  async currentlyActiveChanged({ value }: any) {
    if ((value === 'realDomain' || value === 'expectedDomain') && this.domain.id)
      await this.domainService.setCurrentlyActive(this.domain.id, value)
  }

  

}
