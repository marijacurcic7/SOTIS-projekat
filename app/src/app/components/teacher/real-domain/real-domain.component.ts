import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Domain } from 'src/app/models/domain.model';
import { DomainProblem } from 'src/app/models/domainProblem.model';
import { Take } from 'src/app/models/take.model';
import { DomainService } from 'src/app/services/domain.service';
import { PythonService } from 'src/app/services/python.service';
import { TakeService } from 'src/app/services/take.service';
import { DataSet } from 'vis-data';
import { Network, Options } from 'vis-network';
import { take } from 'rxjs/operators';
import { TestService } from 'src/app/services/test.service';


@Component({
  selector: 'app-real-domain',
  templateUrl: './real-domain.component.html',
  styleUrls: ['./real-domain.component.css']
})
export class RealDomainComponent implements OnInit {
  @Input() domain: Domain | undefined;
  @Input() takes: Take[]

  status: 'getting domain problems' | 'loading packages' | 'creating real domain' | 'saving' | 'done ✔️' | '' = ''
  domainProblems: DomainProblem[]
  implications: [string, string][] = [] // array of domain problems

  answersMatrix: number[][]

  realDomainProblems: DomainProblem[] | undefined

  nodes = new DataSet<DomainProblem>()
  edges = new DataSet<{ id: string, from: string, to: string, arrows: 'to' }>()
  network: Network

  constructor(
    private pythonServce: PythonService,
    private domainService: DomainService,
    private takeService: TakeService,
    private testService: TestService,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    this.initNetwork()
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.domain) {
      this.getRealDomainProblems()
      this.getDomainProblems()
      this.answersMatrix = await this.getAnswersMatrix()
    }
  }


  async createRealDomain() {
    if (!this.domain?.id) throw new Error('domain is missing ID.')
    this.status = 'getting domain problems'
    await this.getDomainProblems()
    this.status = 'loading packages'
    await this.loadPyodide()
    this.status = 'creating real domain'
    try {
      const response = await this.pythonServce.createRealDomain(this.answersMatrix)
      this.status = 'saving'
      const realDomainProblems = await this.implicationsArray2domainProblems(response.implications, this.domainProblems)
      await this.domainService.addRealDomainProblems(realDomainProblems, this.domain)
      this.status = 'done ✔️'
    }
    catch (error) {
      if (error instanceof Error) {
        if (
          error.name === 'PythonError' &&
          error.message.includes('data must be either a numeric matrix or a dataframe, with at least two columns')) {
          this.openFailSnackBar('Not enough test takes to create real domain.')
        }
      }
      else {
        this.openFailSnackBar()
      }
    }


    setTimeout(() => {
      this.status = ''
    }, (2000));
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

  /**
   * This matrix is neccessary for iita algorithm.
   * 1 represents true answer, 0 represents wrong answer.
   * Columns are questions
   * Rows are students answers
   * @returns matrix of all answers that students have made
   */
  async getAnswersMatrix() {
    let answersMatrix: number[][] = []
    for (const testTake of this.takes) {
      if (testTake.id && testTake.user) {
        const studentAnswers = await this.takeService.getMyAnswers(testTake.id, testTake.user.uid).pipe(take(1)).toPromise()
        const studentAnswersArray: number[] = studentAnswers.map(ans => ans.correct === true ? 1 : 0)
        answersMatrix.push(studentAnswersArray)
      }
    }
    return answersMatrix
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

  /**
   * convert implications array into real domain problems.
   * @param imp implications array
   * @param domainProblems expected domain problems
   * @returns new domain problems, real domain problems
   */
  async implicationsArray2domainProblems(imp: [number, number][], domainProblems: DomainProblem[]) {
    // deep copy domain problems
    const newdomainProblems: DomainProblem[] = JSON.parse(JSON.stringify(domainProblems))

    // reset input[] and output[] for each domain problem     
    newdomainProblems.map(problem => problem.output = problem.input = [])

    // get all question for a test take
    if (!this.takes[0].id) throw new Error('take id is missing.')
    const questions = await this.takeService.getQuestions(this.takes[0].id, this.takes[0].user.uid).pipe(take(1)).toPromise()

    // modify input[] & output[] on domain problems
    imp.forEach(async pair => {

      // parentIndex & childIndex are IDs of questions 
      const [parentIndex, childIndex] = pair

      const parentQuestion = questions.find(q => q.id === parentIndex.toString())
      if (!parentQuestion?.domainProblemId) throw new Error('parent question is missing domain problem id')
      const parent = newdomainProblems.find(p => p.id === parentQuestion.domainProblemId)

      const childQuestion = questions.find(q => q.id === childIndex.toString())
      if (!childQuestion?.domainProblemId) throw new Error('child question is missing domain problem id')
      const child = newdomainProblems.find(p => p.id === childQuestion.domainProblemId)

      if (!child?.id || !parent?.id) throw new Error('Child/Parent ID is missing.')

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
      duration: 5000,
    });
  }
}
