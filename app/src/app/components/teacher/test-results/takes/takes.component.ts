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
import { MyAnswer } from 'src/app/models/myAnswer.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyNetwork } from 'src/app/models/my-network.model';
import { take } from 'rxjs/operators';


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
  displayedColumns: string[] = ['student', 'points', 'duration'];
  expandedElement: Take | null;
  expandedElements: Take[];

  // network: Network
  myNetworks: MyNetwork[];
  // nodes = new DataSet<DomainProblem>();
  // problemNodes: { label: string, id?: string, color?: any }[]
  // edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to' }>()
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
    this.myNetworks = [];
  }

  async ngOnInit() {
    const testId = String(this.route.snapshot.paramMap.get('id'))
    this.takes = await this.takeService.getTakesForOneTest(testId).pipe(take(1)).toPromise()
    const test = await this.testService.getTest(testId).pipe(take(1)).toPromise()
    if (!test.domainId) throw new Error('domain ID is missing')
    this.domain = await this.domainService.getDomain(test.domainId).pipe(take(1)).toPromise()

    this.takes.forEach(t => {
      if (!t.id) return;
      let mn = this.myNetworks.find(n => n.id === t.id);
      if (!mn) {
        let myNetwork: MyNetwork = { id: t.id }
        this.myNetworks.push(myNetwork)
      }

      if (this.domain.id) this.initDomainAndDomainProblems(this.domain.id, t.id, t.user.uid)
      this.initNetwork(t)
    })

  }

  toggleRow(t: Take) {
    if (!t.id) return;
    let i = this.expandedElements.indexOf(t);
    if (i > -1) {
      console.log("zatvori");
      this.expandedElements.splice(i);
    }
    else {
      console.log("otvori");
      let mn = this.myNetworks.find(n => n.id === t.id);
      if (!mn) {
        let myNetwork: MyNetwork = {
          id: t.id,
        }
        this.myNetworks.push(myNetwork);
      }
      this.expandedElements.push(t);
    }

    this.cd.detectChanges();

    if (this.domain.id && this.domain.id !== 'null') {
      this.initDomainAndDomainProblems(this.domain.id, t.id, t.user.uid);
    }
    this.initNetwork(t);

  }

  initNetwork(t: Take) {
    // create a network
    var id = t.id ? t.id : "";
    let networkHtmlElem = document.getElementById(id);
    let myNetwork = this.myNetworks.find(n => n.id === id);
    if (!myNetwork) return;
    let data = {
      // nodes: this.nodes,
      // edges: this.edges,
      nodes: myNetwork.nodes,
      edges: myNetwork.edges
    };
    let options: Options = {
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

    if (!networkHtmlElem) return; //console.error('html elem not found');
    let network = new Network(networkHtmlElem, data, options);
    // let myNetwork: MyNetwork = {
    //   id: id,
    //   network: network
    // }
    myNetwork.network = network;

    // this.myNetworks.push(myNetwork);

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
        let mn = this.myNetworks.find(n => n.id === takeId);
        if (!mn) return;
        mn.nodes = new DataSet<DomainProblem>();
        mn.edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to', color: string }>();

        mn.nodes.clear();
        mn.nodes.update(domainProblems);

        // update nodes
        // this.nodes.clear();
        // this.nodes.update(domainProblems);

        // update edges
        domainProblems.forEach(parentNode => {
          parentNode.output?.forEach(childNodeId => {
            if (!mn) return;
            if (!mn.edges) return;
            mn.edges.update({
              id: `${parentNode.id}${childNodeId}`,
              from: parentNode.id,
              to: childNodeId,
              arrows: 'to',
              color: '#dedae6'
            })
          })
        })
        // setTimeout(() => this.centerNetwork(), 200);

        // var passedProblems: string[] = [];

        if (takeId && userId) {
          this.takeService.getMyAnswers(takeId, userId).subscribe(a => {
            this.myAnswers = a;
            for (var answer of this.myAnswers) {
              if (answer.correct) {
                if (!takeId || !userId || !answer.id) return;
                this.takeService.getQuestion(takeId, userId, answer.id).subscribe(q => {
                  this.questions.push(q);
                  if (q.domainProblemId) {
                    var problemNode = {
                      id: q.domainProblemId,
                      label: q.domainProblemName,
                      font: { size: 14, color: '#006627' },
                      color: {
                        background: '#99ff99',
                        border: '#99ff99',
                        highlight: {
                          border: '#99ff99',
                          background: '#99ff99'
                        }
                      }
                    }
                    if (!mn) return;
                    if (!mn.nodes) return;
                    mn.nodes.update(problemNode);
                  }
                });
              }
            }
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

  getDuration(take: Take) {
    if (!take.endTime) return ''
    const end = take.endTime.toDate()
    const start = take.startTime.toDate()

    let dur = "";
    const date = new Date((take.endTime.seconds - take.startTime.seconds) * 1000);
    if ((date.getHours() - 1) > 0) {
      dur = (date.getHours() - 1) + 'h ' + date.getMinutes() + 'm ' + date.getSeconds() + 's';
    }
    else if (date.getMinutes() > 0) {
      dur = date.getMinutes() + 'm ' + date.getSeconds() + 's';
    }
    else {
      dur = date.getSeconds() + 's';
    }

    return dur;

  }

}

