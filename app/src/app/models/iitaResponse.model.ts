export class IitaResponse {
  diff: Float64Array;
  implications: [];
  error: { rate: number };
  selection: { set: { index: number } };
  v: number


  constructor(response: Map<any, any>) {
    this.diff = response.get('diff')
    this.implications = response.get('implications')
    this.error = { rate: response.get('error.rate') }
    this.selection = { set: { index: response.get('selection.set.index') } }
    this.v = response.get('v')
  }
}