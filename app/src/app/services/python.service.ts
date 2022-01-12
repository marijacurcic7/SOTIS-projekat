import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IitaResponse } from '../models/iitaResponse.model';

@Injectable({
  providedIn: 'root'
})
export class PythonService {

  pyodide: any
  officialPackages: string[] = ['cycler', 'matplotlib', 'nose', 'numpy', 'pandas', 'patsy', 'pyparsing', 'python-dateutil', 'pytz', 'scipy', 'six', 'micropip']

  constructor(
    private snackBar: MatSnackBar,
  ) { }



  async createRealDomain(answers: number[][]) {
    this.pyodide.globals.set('answers', answers)
    try {
      await this.pyodide.runPython(`
import pandas as pd
import numpy as np
import numpy
from learning_spaces.kst import iita_exclude_transitive 

answers = answers.to_py()
answers = np.array(answers)
answers = pd.DataFrame(answers)

response = iita_exclude_transitive(answers, v=1)
    `)
      const response = new IitaResponse(this.pyodide.globals.get('response').toJs())
      return response
    }
    catch (error) { throw error }
  }


  /**
   * -------------------Initalization & loading packages methods-----------------
   */

  async downloadLearningSpaces() {
    await this.pyodide.loadPackage(['micropip'])
    // download unofficial packages
    await this.pyodide.runPythonAsync(`
        from micropip import install
        package_url = 'https://raw.githubusercontent.com/marijacurcic7/SOTIS-projekat/main/learning_spaces-0.2.0-py3-none-any.whl'
        await install(package_url)

        `);
  }

  async init() {
    if (this.pyodide) return
    const url = 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js'
    let node = document.createElement('script')
    node.src = url
    node.type = 'text/javascript'
    node.async = false;
    node.defer = true;
    document.getElementsByTagName('head')[0].appendChild(node)

    await new Promise(resolve => setTimeout(resolve, 100));
    //@ts-ignore
    this.pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"
    })
  }

  async downloadPythonPackages() {
    const messageCallback = (msg: any) => { }
    // download official packages
    await this.pyodide.loadPackage(this.officialPackages, messageCallback);
    // download unofficial packages
    await this.pyodide.runPythonAsync(`
    from micropip import install
    await install('pydot')
    `);

    this.openSuccessSnackBar('ready to use')
  }

  openSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      verticalPosition: 'top',
      panelClass: ['green-snackbar'],
      duration: 4000,
    });
  }
  openFailSnackBar(message = 'Something went wrong.'): void {
    this.snackBar.open(message, 'Dismiss', {
      verticalPosition: 'top',
      panelClass: ['red-snackbar']
    });
  }
}
