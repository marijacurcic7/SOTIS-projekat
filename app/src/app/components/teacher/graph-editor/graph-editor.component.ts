import { Component, OnInit } from '@angular/core';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';

@Component({
  selector: 'app-graph-editor',
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.css']
})
export class GraphEditorComponent implements OnInit {

  nodes = new DataSet([
    { id: '1', label: "Node 1" },
    { id: '2', label: "Node 2" },
    { id: '3', label: "Node 3" },
    { id: '4', label: "Node 4" },
    { id: '5', label: "Node 5" },
  ]);

  // create an array with edges

  edges = new DataSet<any>([
    { from: '1', to: '3', arrows: "to" },
    { from: '1', to: '2', arrows: "to" },
    { from: '2', to: '4', arrows: "to" },
    { from: '2', to: '5', arrows: "to" },
  ]);

  constructor() { }

  ngOnInit(): void {
    // create a network
    const container = document.getElementById("mynetwork");
    const data = {
      nodes: this.nodes,
      edges: this.edges,
    };

    if (!container) return
    const network = new Network(container, data, {});
    network.on('click', (params) => {
      if (params && params.nodes && params.nodes.length === 1) {
        const nodeId = params.nodes[0]
        this.addNewNode(nodeId)
      }
    })
  }

  addNewNode(parentNodeId: string) {
    const newNode = { id: '10', label: 'New Node' }
    const newEdge = { from: parentNodeId, to: newNode.id, arrows: "to" }
    // this.nodes.add([newNode])
  }
}
