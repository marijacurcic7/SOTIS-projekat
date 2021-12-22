import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Domain } from 'src/app/models/domain.model';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { DomainService } from 'src/app/services/domain.service';
import { DataSet } from 'vis-data';
import { Network, Options } from 'vis-network';

@Component({
  selector: 'app-real-and-expected-domain',
  templateUrl: './real-and-expected-domain.component.html',
  styleUrls: ['./real-and-expected-domain.component.css']
})
export class RealAndExpectedDomainComponent implements OnInit {
  @Input() domain: Domain | undefined

  domainProblems: DomainProblem[]
  realDomainProblems: DomainProblem[]


  nodes = new DataSet<DomainProblem>()
  edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to', color: string }>()
  network: Network

  constructor(
    private domainService: DomainService
  ) { }

  ngOnInit(): void {
    this.initNetwork()

  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.domain) {
      this.getRealDomainProblems()
      this.getDomainProblems()
    }
  }

  getRealDomainProblems() {
    if (!this.domain?.id) throw new Error('domain ID is missing.')
    this.domainService.getRealDomainProblems(this.domain.id).subscribe(realDomainProblems => {
      if (realDomainProblems && realDomainProblems.length) {
        // set real domains
        this.realDomainProblems = realDomainProblems
        // update nodes
        this.nodes.update(realDomainProblems)
        // reset edges
        this.edges.clear()
        // update edges
        realDomainProblems.forEach(parentNode => {
          parentNode.output?.forEach(childNodeId => {
            this.edges.update({
              id: `${parentNode.id}${childNodeId}`,
              from: parentNode.id,
              to: childNodeId,
              arrows: 'to',
              color: '#8ee2b9'
            })
          })
        })
      }
    })
  }

  async getDomainProblems() {
    if (!this.domain?.id) throw new Error('domain ID is missing.')
    this.domainService.getDomainProblems(this.domain.id).subscribe(domainProblems => {
      if (domainProblems && domainProblems.length) {
        this.domainProblems = domainProblems
        // update edges
        domainProblems.forEach(parentNode => {
          parentNode.output?.forEach(childNodeId => {
            const edge = this.edges.get(`${parentNode.id}${childNodeId}`)
            
            if (edge) {
              this.edges.update({
                id: `${parentNode.id}${childNodeId}`,
                from: parentNode.id,
                to: childNodeId,
                arrows: 'to',
                color: '#f7cf6f'
              })
            }
            else {
              this.edges.update({
                id: `${parentNode.id}${childNodeId}`,
                from: parentNode.id,
                to: childNodeId,
                arrows: 'to',
                color: '#bca3ee'
              })
            }
          })
        })
      }
    })
  }

  initNetwork() {
    // create a network
    const networkHtmlElem = document.getElementById("realAndExpectedDomainNetwork");
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
        font: { size: 14, color: '#5c5c5c' },
        color: {
          border: '#ededed',
          background: '#ededed',
          highlight: {
            border: '#d6d6d6',
            background: '#d6d6d6'
          }
        }
      }
    }

    if (!networkHtmlElem) return console.error('real and expected domain network elem not found')
    this.network = new Network(networkHtmlElem, data, options)

  }
}



/**
 * temparary class that extends DomainProblem to enable colors
 */
class NodeClass extends DomainProblem {
  color: {
    background: string,
    border: string,
    highlight: {
      border: string,
      background: string
    }
  }
}