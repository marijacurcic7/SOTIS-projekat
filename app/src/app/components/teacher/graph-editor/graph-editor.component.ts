import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyNode } from 'src/app/models/myNode.model';
import { DataSet } from 'vis-data';
import { Network, Options } from 'vis-network';
import { EditNodeDialogComponent } from './edit-node-dialog/edit-node-dialog.component';

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
    { id: '13', from: '1', to: '3', arrows: "to" },
    { id: '12', from: '1', to: '2', arrows: "to" },
    { id: '24', from: '2', to: '4', arrows: "to" },
    { id: '25', from: '2', to: '5', arrows: "to" },
  ]);

  network: Network
  selectedNode: MyNode | undefined;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // create a network
    const networkHtmlElem = document.getElementById("mynetwork");
    const data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    const options: Options = {
      interaction: { multiselect: true, zoomView: false },
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
    this.network = new Network(networkHtmlElem, data, options)
    this.edges.forEach

    this.network.on('click', (params) => {
      if (params && params.nodes && params.nodes.length === 1) {
        this.selectedNode = this.nodes.get(params.nodes[0]) as unknown as MyNode
      }
      if (params && params.nodes && params.nodes.length === 2) {
        this.connectTwoNodes(params.nodes[0] as string, params.nodes[1] as string)
        // deselect nodes after connecting them
        setTimeout(() => {
          this.network.selectNodes([])
          this.selectedNode = undefined
        }, 1000);
        // console.log(network.getConnectedNodes(params.nodes[0]))
        // const nodeId = params.nodes[0]
        // this.currentNode = this.nodes.get(nodeId) as unknown as MyNode
      }
    })
    this.network.on('deselectNode', () => {
      console.log('deselected node')
      this.selectedNode = undefined
    })
  }

  connectTwoNodes(parentNodeId: string, childNodeId: string) {
    const newEdge = { from: parentNodeId, to: childNodeId, arrows: "to" }
    // TODO: check if edge exists
    if (this.checkIfEdgeExists(newEdge)) return this.openFailSnackBar('Already connected')
    this.edges.add([newEdge])

    const parentNode = this.nodes.get(parentNodeId) as unknown as MyNode
    const childNode = this.nodes.get(childNodeId) as unknown as MyNode
    this.openSuccessSnackBar(`${parentNode.label} connected to ${childNode.label}`)
  }

  checkIfEdgeExists(newEdge: { from: string, to: string, arrows: string }) {
    let found = false
    this.edges.forEach(edge => {
      const directConnection = (newEdge.from === edge.from && newEdge.to === edge.to)
      const reverseConnection = (newEdge.to === edge.from && newEdge.from === edge.to)
      if (directConnection || reverseConnection) found = true
    })
    return found
  }
  hasOutputNodes(node: MyNode) {
    let found = false
    this.edges.forEach(edge => {
      if (edge.from === node.id) found = true
    })
    return found
  }
  hasInputNodes(node: MyNode) {
    let found = false
    this.edges.forEach(edge => {
      if (edge.to === node.id) found = true
    })
    return found
  }

  createNewNode() {
    const newNode: MyNode = { id: (Math.random() * 100).toString(), label: 'New Node' }
    this.nodes.add([newNode])
    this.centerNetwork()
  }

  editNode() {
    if(!this.selectedNode) return
    const dialogRef = this.dialog.open(EditNodeDialogComponent, {
      // width: ' 10rem',
      data: this.selectedNode.label
    })

    dialogRef.afterClosed().subscribe(async result => {
      if (result && this.selectedNode) {
        this.selectedNode.label = result
        this.nodes.update(this.selectedNode)
      }
    })
  }

  deleteNode() {
    if (!this.selectedNode) return
    const isInnerNode = this.hasOutputNodes(this.selectedNode) && this.hasInputNodes(this.selectedNode)
    if (isInnerNode) {
      return this.openFailSnackBar(`Cannot delete becase ${this.selectedNode.label} is inner node.`)
    }

    // remove edges
    const edgesToBeRemoved = this.network.getConnectedEdges(this.selectedNode.id)
    console.log(edgesToBeRemoved)
    edgesToBeRemoved.forEach(edgeId => this.edges.remove(edgeId))
    // remove node
    this.nodes.remove(this.selectedNode.id)
    this.centerNetwork()
  }

  centerNetwork() {
    this.network.fit({ animation: true })
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
