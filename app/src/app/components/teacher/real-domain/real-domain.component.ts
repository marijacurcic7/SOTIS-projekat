import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Domain } from 'src/app/models/domain.model';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { DomainService } from 'src/app/services/domain.service';
import { PythonService } from 'src/app/services/python.service';

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

  constructor(
    private pythonServce: PythonService,
    private domainService: DomainService,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
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
      await this.getRealDomainProblems()
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

    setTimeout(() => {
      this.status = ''
      // TODO: SHOW GRAPH
    }, 3500);
  }

  async getRealDomainProblems() {
    if (!this.domain?.id) throw new Error('domain ID is missing.')
    this.domainService.getRealDomainProblems(this.domain.id).subscribe(realDomainProblems => {
      if (realDomainProblems && realDomainProblems.length) {
        this.realDomainProblems = realDomainProblems
        this.implications = this.domainProblems2implicationsArray(realDomainProblems)
      }
      // else this.openSuccessSnackBar('Real domain problems is empty.')
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
