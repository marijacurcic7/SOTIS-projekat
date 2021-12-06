import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Domain } from 'src/app/models/domain.model';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { DomainService } from 'src/app/services/domain.service';
import { PythonService } from 'src/app/services/python.service';
import { DataSet } from 'vis-data';
import { Network, Options } from 'vis-network';

@Component({
  selector: 'app-real-domain',
  templateUrl: './real-domain.component.html',
  styleUrls: ['./real-domain.component.css']
})
export class RealDomainComponent implements OnInit {
  @Input() domain: Domain | undefined;
  status: 'getting domain problems' | 'loading packages' | 'creating real domain' | 'saving' | 'done ✔️' | '' = ''
  domainProblems: DomainProblem[]
  implications: [string, string][] = [] // array of domain problems

  realDomainProblems: DomainProblem[] | undefined

  nodes = new DataSet<DomainProblem>()
  edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to' }>()
  network: Network

  constructor(
    private pythonServce: PythonService,
    private domainService: DomainService,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    this.initNetwork()
    // const domainProblems: DomainProblem[] = [
    //   {
    //     "label": "Variables",
    //     "output": [
    //       "rQ4NqGjKDXBCYGDvJXzs",
    //       "AvFRGplnBT2bJpGDVQMW",
    //       "Vnyz9n188eNdGVePaBtV"
    //     ],
    //     "id": "0AAPNeAbygGZg6beETfZ"
    //   },
    //   {
    //     "label": "Const",
    //     "output": [
    //       "MRWv0XeYubFiaqzm9wZt"
    //     ],
    //     "id": "AvFRGplnBT2bJpGDVQMW"
    //   },
    //   {
    //     "label": "Data Types",
    //     "output": [
    //       "aiJn1aQBmoAtmyNvQDhd"
    //     ],
    //     "id": "MRWv0XeYubFiaqzm9wZt"
    //   },
    //   {
    //     "label": "Functions",
    //     "output": [
    //       "aiJn1aQBmoAtmyNvQDhd"
    //     ],
    //     "id": "Vnyz9n188eNdGVePaBtV"
    //   },
    //   {
    //     "label": "Objects",
    //     "output": [],
    //     "id": "aiJn1aQBmoAtmyNvQDhd"
    //   },
    //   {
    //     "label": "Let",
    //     "output": [
    //       "MRWv0XeYubFiaqzm9wZt"
    //     ],
    //     "input": [
    //       "0AAPNeAbygGZg6beETfZ"
    //     ],
    //     "id": "rQ4NqGjKDXBCYGDvJXzs"
    //   }
    // ]
    // const tempImpl: [number, number][] = [[2, 0], [2, 1], [3, 0], [5, 0], [5, 4]]
    // const ret = this.implicationsArray2domainProblems(tempImpl, domainProblems)
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.domain) {
      this.getRealDomainProblems()
    }
  }


  async createRealDomain() {
    if (!this.domain?.id) throw new Error('domain is missing ID.')
    this.status = 'getting domain problems'
    await this.getDomainProblems()
    this.status = 'loading packages'
    await this.loadPyodide()
    this.status = 'creating real domain'
    const response = await this.pythonServce.createRealKnowledgeSpace(this.implications, this.domainProblems.length)
    this.status = 'saving'
    const realDomainProblems = this.implicationsArray2domainProblems(response.implications, this.domainProblems)
    await this.domainService.addRealDomainProblems(realDomainProblems, this.domain)
    this.status = 'done ✔️'
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
              arrows: 'to'
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
        this.implications = this.domainProblems2implicationsArray(domainProblems)
      }
      else this.openSuccessSnackBar('Domain Problems is empty.')
    })
  }

  async loadPyodide() {
    await this.pythonServce.init()
    await this.pythonServce.downloadLearningSpaces()
  }

  /**
   * convert domainProblems to implications array [[parent, child], [parent, child],...]
   * @param domainProblems object to be converted
   */
  domainProblems2implicationsArray(domainProblems: DomainProblem[]) {
    const implications: [string, string][] = []
    domainProblems.forEach(problem => {
      problem.output?.forEach(child => {
        if (problem.id) implications.push([problem.id, child])
      })
    })
    return implications
  }

  implicationsArray2domainProblems(imp: [number, number][], domainProblems: DomainProblem[]) {
    // deep copy object
    const newdomainProblems: DomainProblem[] = JSON.parse(JSON.stringify(domainProblems))

    // reset input and output array for each domain problem     
    newdomainProblems.map(problem => problem.output = problem.input = [])

    // modify newdomainProblems input & output
    imp.forEach((pair, i) => {
      const [parentIndex, childIndex] = pair
      const parent = newdomainProblems[parentIndex]
      const child = newdomainProblems[childIndex]

      if (!child.id || !parent.id) throw new Error('Child/Parent ID is missing.')

      const outputList = parent.output ? [...parent.output, child.id] : [child.id]
      const inputList = child.input ? [...child.input, parent.id] : [parent.id]

      parent.output = outputList
      child.input = inputList
    })
    return newdomainProblems
  }

  initNetwork() {
    // create a network
    const networkHtmlElem = document.getElementById("realDomainNetwork");
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
        font: { size: 14, color: '#2d735c' },
        color: {
          border: '#dae6de',
          background: '#dae6de',
          highlight: {
            border: '#c8e3d6',
            background: '#c8e3d6'
          }
        }
      }
    }

    if (!networkHtmlElem) return console.error('real domain network elem not found')
    this.network = new Network(networkHtmlElem, data, options)

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
