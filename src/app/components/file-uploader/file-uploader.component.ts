import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DataFrame, fromCSV, IDataFrame} from "data-forge";
import {WebService} from "../../service/web.service";

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css']
})
export class FileUploaderComponent implements OnInit {
  fileName: string = "";
  file: File|undefined;
  df: IDataFrame|undefined;
  @Output() dataframe = new EventEmitter<IDataFrame>();
  sampleLabelIsColumnName = true
  firstColumnIsFeatures = false
  constructor(private http: WebService) {

  }

  handleFile(e: Event) {
    if (e.target) {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.file = target.files[0];
        this.fileName = target.files[0].name;
        const reader = new FileReader();

        reader.onload = (event) => {
          const loadedFile = reader.result;
          this.df = fromCSV(<string>loadedFile);

          if (this.sampleLabelIsColumnName) {
            const data = this.transpose(this.df);

            this.dataframe.emit(data)
          } else {
            const columns = this.df.getColumnNames()
            const sample = columns[0]
            const renameOb: any = {}
            renameOb[sample] = "Samples"
            this.df = this.df.renameSeries(renameOb)
            this.dataframe.emit(this.df);
          }

        };
        reader.readAsText(this.file);
      }
    }
  }

  private transpose(dataframe: IDataFrame) {
    const temp: any = {}

    const columns = dataframe.getColumnNames()
    let features =[]
    let samples = columns
    if (this.firstColumnIsFeatures) {
      samples = samples.slice(1)
      features = dataframe.getSeries(columns[0]).distinct().bake().toArray()
    } else {

      for (let i = 0; i < dataframe.count(); i++) {
        features.push(i.toString())
      }
    }


    let ind = 0
    for (const r of dataframe) {
      if (!(ind.toString() in temp)) {
        temp[ind.toString()] = []
      }
      for (const c of samples) {
        temp[ind.toString()].push(r[c])
      }
      ind ++
    }
    const temp2: any = {}
    for (const c of samples) {
      temp2[c] = {"Samples": c}
    }
    console.log(temp2)
    for (const f of features) {
      for (let i = 0; i < temp[f].length; i++) {
        temp2[samples[i]][f] = parseFloat(temp[f][i])
      }
    }
    return new DataFrame(Object.values(temp2));
  }

  loadTest() {
    this.http.getWideInput().subscribe(data => {
      this.df = fromCSV(<string>data.body)
      const temp = this.transpose(this.df)
      this.dataframe.emit(temp)
    })
  }

  ngOnInit(): void {
  }

}
