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
  isPythonReady = false
  domainProblems: DomainProblem[]
  implications: [string, string][] = [] // array of domain problems

  constructor(
    private pythonServce: PythonService,
    private domainService: DomainService,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.domain) {
      await this.getDomainProblems()
      await this.loadPyodide()

      await this.pythonServce.createRealKnowledgeSpace(this.implications, this.domainProblems.length)
    }
  }

  async loadPyodide() {
    await this.pythonServce.init()
    await this.pythonServce.downloadLearningSpaces()
    this.isPythonReady = true
    // await this.pythonServce.runPythonCode()
  }

  async getDomainProblems() {
    if (!this.domain?.id) throw new Error('domain ID is missing.')
    this.domainService.getDomainProblems(this.domain.id).subscribe(domainProblems => {
      if (domainProblems && domainProblems.length) {
        this.domainProblems = domainProblems
        // convert domainProblems to implications array [[parent, child], [parent, child],...]
        domainProblems.forEach(problem => {
          problem.output?.forEach(child => {
            if (problem.id) this.implications.push([problem.id, child])
          })
        })
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
