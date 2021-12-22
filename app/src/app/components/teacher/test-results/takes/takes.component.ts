import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Take } from 'src/app/models/take.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { DomainService } from 'src/app/services/domain.service';
import { TakeService } from 'src/app/services/take.service';
import { TestService } from 'src/app/services/test.service';
import { Domain } from 'src/app/models/domain.model';
import { Network, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { Question } from 'src/app/models/question.model';
import { MyAnswer } from 'src/app/models/my-answer.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-takes',
  templateUrl: './takes.component.html',
  styleUrls: ['./takes.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TakesComponent implements OnInit {

  takes: Take[];
  domain: Domain;
  displayedColumns: string[] = ['student', 'points'];
  expandedElement: Take | null;
  expandedElements: Take[];

  network: Network
  nodes = new DataSet<DomainProblem>();
  problemNodes: { label: string, id?: string, color?: any }[]
  edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to' }>()
  isRealDomainVisible = false;
  myAnswers: MyAnswer[];
  questions: Question[];
  takeId: string;

  constructor(
    private snackBar: MatSnackBar,
    private testService: TestService,
    private takeService: TakeService,
    private domainService: DomainService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) { 
    this.expandedElements = [];
    this.questions = [];
    this.myAnswers = [];
  }

  ngOnInit(): void {
    const testId = String(this.route.snapshot.paramMap.get('id'))
    this.takeService.getTakesForOneTest(testId).subscribe(takes => {
      this.takes = takes;
      console.log(this.takes);
    });
    this.testService.getTest(testId).subscribe(test => {
      console.log(test.domainId)
      if (test.domainId) this.domainService.getDomain(test.domainId).subscribe(domain => { 
        if (domain){
          this.domain = domain;
          this.domain.id = test.domainId;
          console.log(domain.id);

          // this.initNetwork();
          console.log(domain.id);
          // if(domain.id && domain.id !== 'null') {
          //   this.domainId = domainId;
          //   this.initDomainAndDomainProblems(domainId);
          // }
        }  
      });
    });
  }

  toggleRow(t: Take) {
    console.log(this.domain.id);
    let testid = String(this.route.snapshot.paramMap.get('id'));
    console.log(testid);
    if (!t.id) return;
    console.log(t.id);
    // this.testService.getAnswer(id, q.id).subscribe(a => {
    //   this.answer = a;
    // });

    let i = this.expandedElements.indexOf(t);
    if(i > -1) this.expandedElements.splice(i);
    else this.expandedElements.push(t);

    // q.possibleAnswers && q.possibleAnswers.length ? (this.expandedElement = this.expandedElement === q ? null : q) : null;
    this.cd.detectChanges();

    this.initNetwork();
    if(this.domain.id && this.domain.id !== 'null') {
      this.initDomainAndDomainProblems(this.domain.id, t.id, t.user.uid);
    }

  }

  initNetwork() {
    // create a network
    const networkHtmlElem = document.getElementById("mynetwork");
    const data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    const options: Options = {
      interaction: { multiselect: true, zoomView: false },
      // physics: {enabled: false},
      autoResize: true,
      height: '100%',
      width: '100%',
      nodes: {
        shape: 'box',
        margin: { top: 5, bottom: 5, left: 5, right: 5 },
        font: { size: 14, color: '#462d73' },
        color: {
          border: '#dedae6',
          background: '#dedae6',
          highlight: {
            border: '#d1c8e3',
            background: '#d1c8e3'
          }
        }
      }
    }

    if (!networkHtmlElem) return console.error('html elem not found')
    this.network = new Network(networkHtmlElem, data, options);
    
  }


  initDomainAndDomainProblems(domainId: string, takeId: string, userId: string) {
    this.domainService.getDomain(domainId).subscribe(domain => {
      if (domain) {
        this.domain = domain
        this.domain.id = domainId
      }
      else this.openFailSnackBar('Domain not found.')
    })

    this.domainService.getDomainProblems(domainId).subscribe(domainProblems => {
      if (domainProblems && domainProblems.length) {

        // update nodes
        // this.nodes.clear()
        this.nodes.update(domainProblems)

        // domainProblems.forEach(dp => {
        //   this.nodes.update({
        //     id: dp.id,
        //     label: dp.label,
        //     color: {
        //       background: '#f0d5a3',
        //       border: '#f0d5a3',
        //       highlight: {
        //         border: '#f0d5a3',
        //         background: '#f0d5a3'
        //       }
        //     }
        //   })
          
        // })

        // this.problemNodes = domainProblems.map(problem => {
        //   return {
        //     id: problem.id,
        //     label: problem.label,
        //     color: {
        //       background: '#f0d5a3',
        //       border: '#f0d5a3',
        //       highlight: {
        //         border: '#f0d5a3',
        //         background: '#f0d5a3'
        //       }
        //     }
        //   }
        // });

        // update edges
        domainProblems.forEach(parentNode => {
          parentNode.output?.forEach(childNodeId => {
            this.edges.update({
              id: `${parentNode.id}${childNodeId}`,
              from: parentNode.id,
              to: childNodeId,
              arrows: 'to'
            })
          })
        })
        // setTimeout(() => this.centerNetwork(), 200);

        var passedProblems: string[] = [];

        if(takeId && userId){
          this.takeService.getMyAnswers(takeId, userId).subscribe(a => {
            this.myAnswers = a;
            for(var answer of this.myAnswers){
              if(answer.correct){
                if(!takeId || !userId || !answer.id) return;
                this.takeService.getQuestion(takeId, userId, answer.id).subscribe(q => {
                  this.questions.push(q);
                  if(q.domainProblemId) {
                    console.log(q.domainProblemId);
                    passedProblems.push(q.domainProblemId);
                    this.nodes.update({

                    })
                  }
                });
              }
            }
            console.log(this.questions);
            // var passedProblems: string[] = [];
            if(passedProblems.length > 0) console.log(passedProblems[0]);
            for(let p of passedProblems){
              console.log("ovde");
              console.log(p);
              // if(question.domainProblemId) {
              //   console.log(question.domainProblemId);
              //   // passedProblems.push(question.domainProblemId);
              // }
            }
            console.log(passedProblems);
          });
        }

      }

      else this.openSuccessSnackBar('Domain Problems is empty.')
    })
  }


  openSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      verticalPosition: 'top',
      panelClass: ['green-snackbar'],
      duration: 2000,
    });
  }

  openFailSnackBar(message = 'Something went wrong.'): void {
    this.snackBar.open(message, 'Dismiss', {
      verticalPosition: 'top',
      panelClass: ['red-snackbar'],
      duration: 2000,
    });
  }

}
