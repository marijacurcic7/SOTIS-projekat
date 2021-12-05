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

  // TODO: zapravo pokrenuti Knowledge Space Theory
  async runPythonCode() {

    await this.pyodide.runPython(`
import pandas as pd
from learning_spaces.kst import iita

def generate_answers(num_of_questions, num_of_students, implications):
  result = simu(items=num_of_questions, size=num_of_students, ce=0.05, lg=0.1, delta=0, imp=implications)
  answers = result['dataset']
  return pd.DataFrame(answers)

data_frame = pd.DataFrame({'a': [1, 0, 1], 'b': [0, 1, 0], 'c': [0, 1, 1]})
response = iita(data_frame, v=1)
print(response)
    `)

    const response = new IitaResponse(this.pyodide.globals.get('response').toJs())
    console.log(response)

  }

  async createRealKnowledgeSpace(implications: [string, string][], numOfDomainProblems: number, numOfStudents: number = 100) {
    // numOfDomainProblems is similar to number of questions on a test
    this.pyodide.globals.set('implications', implications)
    this.pyodide.globals.set('num_of_domains', numOfDomainProblems)
    this.pyodide.globals.set('num_of_students', numOfStudents)

    await this.pyodide.runPython(`
import pandas as pd
from learning_spaces.kst import iita, simu

implications = implications.to_py()

def generate_answers(num_of_domains, num_of_students, implications):
  result = simu(items=num_of_domains, size=num_of_students, ce=0.05, lg=0.1, delta=0, imp=implications)
  answers = result['dataset']
  return pd.DataFrame(answers)

answers = generate_answers(num_of_domains, num_of_students, implications)
response = iita(answers, v=1)
    `)
    const response = new IitaResponse(this.pyodide.globals.get('response').toJs())
    return response
  }

  

  /**
   * -------------------Initalization & loading packages methods-----------------
   */

  async downloadLearningSpaces() {
    await this.pyodide.loadPackage(['micropip'])
    // download unofficial packages
    await this.pyodide.runPythonAsync(`
        from micropip import install
        package_url = 'https://raw.githubusercontent.com/marijacurcic7/SOTIS-projekat/pyodide/learning_spaces-0.1.0-py3-none-any.whl'
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
