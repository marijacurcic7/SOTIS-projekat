import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PythonService {

  pyodide: any
  officialPackages: string[] = ['cycler', 'matplotlib', 'nose', 'numpy', 'pandas', 'patsy', 'pyparsing', 'python-dateutil', 'pytz', 'scipy', 'six', 'micropip']

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  // TODO: zapravo pokrenuti Knowledge Space Theory
  async runPythonCode() {

    await this.pyodide.runPython(`
    import pandas as pd
    import numpy as np
    import sys
    from os import getcwd, listdir
    cwd = getcwd()
    print(listdir(cwd))
    
    `)
    console.log(this.pyodide.globals.get('cwd'))

  }


  /**
   * -------------------Initalization & loading packages methods-----------------
   */

  async downloadKnowledgeSpaceTheoryPackage() {
    await this.pyodide.loadPackage(['micropip'])
        // download unofficial packages
        await this.pyodide.runPythonAsync(`
        from micropip import install
        package_url = 'pydot'
        await install(package_url)
        `);
  }

  async init() {
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

  async runPythonCodeFromFile(pathToPythonFile: string = './assets/python/test.py') {
    const pythonCode = await (await fetch(pathToPythonFile)).text()
    console.log(pythonCode)
    const ret = this.pyodide.runPython(pythonCode)
    console.log(ret)
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
