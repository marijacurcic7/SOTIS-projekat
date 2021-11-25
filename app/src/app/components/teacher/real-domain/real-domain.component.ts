import { Component, OnInit } from '@angular/core';
import { PythonService } from 'src/app/services/python.service';

@Component({
  selector: 'app-real-domain',
  templateUrl: './real-domain.component.html',
  styleUrls: ['./real-domain.component.css']
})
export class RealDomainComponent implements OnInit {

  isPyodideLoaded = false
  constructor(
    private pythonServce: PythonService,
  ) {
  }

  async ngOnInit() {
    await this.pythonServce.init()
    await this.pythonServce.runPythonCode()
  }
}
