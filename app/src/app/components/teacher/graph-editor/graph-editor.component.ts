import { Component, OnInit } from '@angular/core';
import { MyNode } from 'src/app/models/myNode.model';
import { DataSet } from 'vis-data';
import { Network, Options } from 'vis-network';

@Component({
  selector: 'app-graph-editor',
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.css']
})
export class GraphEditorComponent implements OnInit {

  nodes = new DataSet<MyNode>([
    { id: '1', label: "Node 1", inputNodes: [] },
    { id: '2', label: "Node 2" },
    { id: '3', label: "Node 3" },
    { id: '4', label: "Node 4" },
    { id: '5', label: "Html tags" },
  ]);

  // create an array with edges

  edges = new DataSet<any>([
    { from: '1', to: '3', arrows: "to" },
    { from: '1', to: '2', arrows: "to" },
    { from: '2', to: '4', arrows: "to" },
    { from: '2', to: '5', arrows: "to" },
  ]);

  currentNode: MyNode | undefined;

  constructor() { }

  ngOnInit(): void {
    // create a network
    const networkHtmlElem = document.getElementById("mynetwork");
    const data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    const options: Options = {
      autoResize: true,
      height: '100%',
      width: '100%',
      nodes: {
        shape: 'box',
        margin: { top: 10, bottom: 10, left: 10, right: 10 },
        font: { size: 18, color: '#462d73' },
        color: {
          border: '#dedae6',
          background: '#dedae6',
          highlight: {
            border: '#d1c8e3',
            background: '#d1c8e3'
          }
        }
      }
    }

    if (!networkHtmlElem) return
    const network = new Network(networkHtmlElem, data, options);
    network.on('click', (params) => {
      if (params && params.nodes && params.nodes.length === 1) {
        const nodeId = params.nodes[0]
        this.currentNode = this.nodes.get(nodeId) as unknown as MyNode
        // this.addNewNode(nodeId)
      }
      else if (params && params.nodes && params.nodes.length === 0) {
        console.log('no nodes')
        this.currentNode = undefined
      }
    })

  }

  addNewNode(parentNodeId: string) {
    const newNode: MyNode = { id: (Math.random() * 100).toString(), label: 'New Node' }
    const newEdge = { from: parentNodeId, to: newNode.id, arrows: "to" }
    this.nodes.add([newNode])
    this.edges.add([newEdge])
  }

  // TODO: IMPLEMENTIRATI OVE METODE, dodati neka polja za unos.
  // note: bolje da budu u okviru ove stranice, a ne dijaloga, jer onda korisnik nece videti graph editor od dijaloga
  createNewNode() {

  }
  editInputNodes() {

  }
  editOutputNodes() {

  }
  deleteNode() {

  }
}
