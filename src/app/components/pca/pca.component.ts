import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {PCA} from "ml-pca";

@Component({
  selector: 'app-pca',
  templateUrl: './pca.component.html',
  styleUrls: ['./pca.component.css']
})
export class PcaComponent implements OnInit {
  get data(): IDataFrame {
    return this._data
  }
  _data: IDataFrame = new DataFrame()
  @Output() dataframe = new EventEmitter<IDataFrame>()
  samples: any[] = []
  matrix: any[][] = []
  @Input() set data(value:IDataFrame) {
    this.samples = value.getSeries("Samples").bake().toArray()
    this._data = value.dropSeries("Samples").bake()
    this.matrix = this._data.toRows()
    this.doPCA()
  }

  constructor() { }

  ngOnInit(): void {

  }

  doPCA() {
    const pca = new PCA(this.matrix)
    console.log(pca.getEigenvalues())
    console.log(pca.getCumulativeVariance())
    console.log(pca.getLoadings())
    console.log(pca.getExplainedVariance())
    const vectors = pca.predict(this.matrix, {nComponents: 2}).to2DArray()

    const temp = []
    for (let i = 0; i<this.samples.length; i++) {
      temp.push({"Samples": this.samples[i], "PCA1": vectors[i][0], "PCA2": vectors[i][1]})
    }
    this.dataframe.emit(new DataFrame(temp))
  }

}
