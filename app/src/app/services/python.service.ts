import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PythonService {

  pyodide: any

  constructor() { }

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

  async runPythonCode(pathToPythonFile: string = './assets/python/test.py') {
    const pythonCode = await (await fetch(pathToPythonFile)).text()
    console.log(pythonCode)
    const ret = this.pyodide.runPython(pythonCode)
    console.log(ret)
  }
}
