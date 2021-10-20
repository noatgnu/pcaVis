import {Component, Input, OnInit} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {PlotlyService} from "angular-plotly.js";

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {
  graphData: any[] = []
  graphLayout: any = {title:"PCA", width: 1000, height: 1000,
    xaxis:{"tickangle": 90}}

  _data: IDataFrame = new DataFrame();
  @Input() set data(value:IDataFrame) {
    this._data = value
    console.log(value)
    this.graphScatterPlot()
  }
  get data(): IDataFrame {
    return this._data
  }
  constructor(private plotly: PlotlyService) { }

  async downloadPlotlyExtra(format: string) {
    const graph = this.plotly.getInstanceByDivId("scatterplot");
    const p = await this.plotly.getPlotly();
    await p.downloadImage(graph, {format: format, width: 1000, height: 1000, filename: "image"})

  }

  ngOnInit(): void {
  }

  graphScatterPlot(group: any = {}) {
    const temp: any = {}
    this.graphData = []
    if (Object.keys(group).length === 0) {
      for (const r of this._data) {
        if (!(r.Samples in temp)) {
          temp[r.Samples] = {
            x: [], y: [], type: 'scatter', name: r.Samples, mode: 'markers'
          }
        }
        temp[r.Samples].y.push(r.PCA1)
        temp[r.Samples].x.push(r.PCA2)
      }
    } else {
      for (const r of this._data) {
        if (!(group[r.Samples] in temp)) {
          temp[group[r.Samples]] = {
            x: [], y: [], type: 'scatter', name: group[r.Samples], mode: 'markers'
          }
        }
        temp[group[r.Samples]].y.push(r.PCA2)
        temp[group[r.Samples]].x.push(r.PCA1)
      }
    }
    for (const t in temp) {
      this.graphData.push(temp[t])
    }
  }
}
