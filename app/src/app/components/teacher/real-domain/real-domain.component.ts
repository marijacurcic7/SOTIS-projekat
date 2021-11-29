import { Component, OnInit } from '@angular/core';
import { PythonService } from 'src/app/services/python.service';

@Component({
  selector: 'app-real-domain',
  templateUrl: './real-domain.component.html',
  styleUrls: ['./real-domain.component.css']
})
export class RealDomainComponent implements OnInit {

  isPythonReady = false
  constructor(
    private pythonServce: PythonService,
  ) {
  }

  async ngOnInit() {
    await this.pythonServce.init()
    // await this.pythonServce.downloadPythonPackages()
    await this.pythonServce.downloadKnowledgeSpaceTheoryPackage()
    this.isPythonReady = true
    // await this.pythonServce.runPythonCode()
  }
}
