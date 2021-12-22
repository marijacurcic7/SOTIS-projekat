import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Domain } from 'src/app/models/domain.model';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { MyAnswer } from 'src/app/models/my-answer.model';
import { Question } from 'src/app/models/question.model';
import { DomainService } from 'src/app/services/domain.service';
import { TakeService } from 'src/app/services/take.service';
import { DataSet } from 'vis-data';
import { Network, Options } from 'vis-network';

@Component({
  selector: 'app-student-graph',
  templateUrl: './student-graph.component.html',
  styleUrls: ['./student-graph.component.css']
})
export class StudentGraphComponent implements OnInit {
  @Input() domainId: string | undefined;
  @Input() takeId: string | undefined;
  @Input() userId: string | undefined;

  network: Network
  // selectedNode: DomainProblem | undefined;
  domain: Domain | undefined
  nodes = new DataSet<DomainProblem>()
  edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to' }>()
  isRealDomainVisible = false;
  myAnswers: MyAnswer[];
  questions: Question[];

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private domainService: DomainService,
    private takeService: TakeService,
   ) { 
    this.questions = [];
    this.myAnswers = [];
   }

  ngOnInit(): void {
    this.initNetwork();
    const domainId = String(this.route.snapshot.paramMap.get('domainId'));
    console.log(domainId);
    if(domainId && domainId !== 'null') {
      this.domainId = domainId;
      this.initDomainAndDomainProblems(domainId);
    }
  }

  initDomainAndDomainProblems(domainId: string) {
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

        if(this.takeId && this.userId){
          this.takeService.getMyAnswers(this.takeId, this.userId).subscribe(a => {
            this.myAnswers = a;
            for(var answer of this.myAnswers){
              if(answer.correct){
                if(!this.takeId || !this.userId || !answer.id) return;
                this.takeService.getQuestion(this.takeId, this.userId, answer.id).subscribe(q => {
                  this.questions.push(q);
                  if(q.domainProblemId) {
                    console.log(q.domainProblemId);
                    passedProblems.push(q.domainProblemId);
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
          this.colorNodes(passedProblems);
        }

      }

      else this.openSuccessSnackBar('Domain Problems is empty.')
    })
  }

  colorNodes(passedProblems: string[]){
    console.log(passedProblems);
    // var nnode = this.nodes.get("MRWv0XeYubFiaqzm9wZt") as unknown as DomainProblem;
    // console.log(nnode);
    // var pos = this.network.getPosition("MRWv0XeYubFiaqzm9wZt");
    // console.log(pos);
    // console.log(this.network.getNodeAt(pos));

    // this.nodes.update({
    //   id: "MRWv0XeYubFiaqzm9wZt",
    //   label: "Data Types",
    //   color: {
    //   }
    // })
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

    // this.network.on('click', (params) => {
    //   if (params && params.nodes && params.nodes.length === 1) {
    //     this.selectedNode = this.nodes.get(params.nodes[0]) as unknown as DomainProblem
    //   }
    //   if (params && params.nodes && params.nodes.length === 2) {
    //     this.connectTwoNodes(params.nodes[0] as string, params.nodes[1] as string)
    //     // deselect nodes after connecting them
    //     setTimeout(() => {
    //       this.network.selectNodes([])
    //       this.selectedNode = undefined
    //     }, 1000);
    //   }
    // });
    // this.network.on('deselectNode', () => {
    //   console.log('deselected node')
    //   this.selectedNode = undefined
    // });
    
  }

  // async connectTwoNodes(parentNodeId: string, childNodeId: string) {
  //   if (!this.domain) return
  //   const newEdge = { from: parentNodeId, to: childNodeId, arrows: "to" }
  //   if (this.checkIfEdgeExists(newEdge)) return this.openFailSnackBar('Already connected')

  //   const parentNode = this.nodes.get(parentNodeId) as unknown as DomainProblem
  //   const childNode = this.nodes.get(childNodeId) as unknown as DomainProblem
  //   // add to db
  //   await this.domainService.connectTwoNodes(parentNode, childNode, this.domain)
  //   this.openSuccessSnackBar(`${parentNode.label} connected to ${childNode.label}`)
  // }

  // checkIfEdgeExists(newEdge: { from: string, to: string, arrows: string }) {
  //   let found = false
  //   this.edges.forEach(edge => {
  //     const directConnection = (newEdge.from === edge.from && newEdge.to === edge.to)
  //     const reverseConnection = (newEdge.to === edge.from && newEdge.from === edge.to)
  //     if (directConnection || reverseConnection) found = true
  //   })
  //   return found
  // }

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
