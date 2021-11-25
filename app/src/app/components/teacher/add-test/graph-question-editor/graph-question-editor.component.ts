import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Domain } from 'src/app/models/domain.model';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { DomainService } from 'src/app/services/domain.service';
import { DataSet } from 'vis-data';
import { Network, Options } from 'vis-network';

@Component({
  selector: 'app-graph-question-editor',
  templateUrl: './graph-question-editor.component.html',
  styleUrls: ['./graph-question-editor.component.css']
})
export class GraphQuestionEditorComponent implements OnInit {
  @Input() message: string;
  @Output() someEvent = new EventEmitter();
  network: Network
  selectedNode: DomainProblem | undefined;
  domain: Domain | undefined
  nodes = new DataSet<DomainProblem>()
  edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to' }>()

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private domainService: DomainService
  ) { }

  ngOnInit(): void {
    this.initNetwork()
    this.initDomainAndDomainProblems()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initNetwork();
    this.initDomainAndDomainProblems();
  }

  initDomainAndDomainProblems() {
    // const domainId = 'mQUjGBxfSBbT7nuwuxow' // TODO: PROMENITI
    
    var domainId = this.message;
    this.domainService.getDomain(domainId).subscribe(domain => {
      if (domain) {
        this.domain = domain
        this.domain.id = domainId
      }
      else{
        this.openFailSnackBar('Domain not found.');
      } 
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
      }
      else this.openSuccessSnackBar('Domain Problems is empty.')
    })
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
    this.network = new Network(networkHtmlElem, data, options)

    this.network.on('click', (params) => {
      if (params && params.nodes && params.nodes.length === 1) {
        this.selectedNode = this.nodes.get(params.nodes[0]) as unknown as DomainProblem
      }
      if (params && params.nodes && params.nodes.length === 2) {
        this.connectTwoNodes(params.nodes[0] as string, params.nodes[1] as string)
        // deselect nodes after connecting them
        setTimeout(() => {
          this.network.selectNodes([])
          this.selectedNode = undefined
        }, 1000);
      }
    })
    this.network.on('deselectNode', () => {
      this.selectedNode = undefined
    })
    this.network.on('doubleClick', () => this.addQuestionDialog())
  }

  async connectTwoNodes(parentNodeId: string, childNodeId: string) {
    if (!this.domain) return
    const newEdge = { from: parentNodeId, to: childNodeId, arrows: "to" }
    if (this.checkIfEdgeExists(newEdge)) return this.openFailSnackBar('Already connected')

    const parentNode = this.nodes.get(parentNodeId) as unknown as DomainProblem
    const childNode = this.nodes.get(childNodeId) as unknown as DomainProblem
    // add to db
    await this.domainService.connectTwoNodes(parentNode, childNode, this.domain)
    this.openSuccessSnackBar(`${parentNode.label} connected to ${childNode.label}`)
  }

  addQuestionDialog() {
    if (!this.selectedNode) return;
    this.someEvent.emit(this.selectedNode);
  }



  centerNetwork() {
    this.network.fit({ animation: true })
  }

  checkIfEdgeExists(newEdge: { from: string, to: string, arrows: string }) {
    let found = false
    this.edges.forEach(edge => {
      const directConnection = (newEdge.from === edge.from && newEdge.to === edge.to)
      const reverseConnection = (newEdge.to === edge.from && newEdge.from === edge.to)
      if (directConnection || reverseConnection) found = true
    })
    return found
  }
  hasOutputNodes(node: DomainProblem) {
    let found = false
    this.edges.forEach(edge => {
      if (edge.from === node.id) found = true
    })
    return found
  }
  hasInputNodes(node: DomainProblem) {
    let found = false
    this.edges.forEach(edge => {
      if (edge.to === node.id) found = true
    })
    return found
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
