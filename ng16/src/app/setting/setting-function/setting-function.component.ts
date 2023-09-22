import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-setting-function',
  templateUrl: './setting-function.component.html',
  styleUrls: ['./setting-function.component.css']
})
export class SettingFunctionComponent {
  @ViewChild('item') item!: ElementRef;

  items = Array.from({ length: 12 }).map((_, i) => i);
  saveFunc: any = [];
  constructor(
    private http : HttpClient,
    private configService : ConfigService,
  ) {
    if (!localStorage.getItem("function.pos")) {
      this.saveFunc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      localStorage.setItem("function.pos", this.saveFunc);
    } else {
      //this.saveFunc = localStorage.getItem("function.pos");
      // console.log(localStorage.getItem("function.pos"));
      const storedDataString = localStorage.getItem("function.pos");

      if (storedDataString) {
        const storedData = JSON.parse(storedDataString);
        const strArray = storedData.map(String);
        console.log(strArray);  
        this.saveFunc = strArray;
      } else {
        console.log("Data tidak ditemukan di localStorage.");
      }
    }
  }
  back() {
    history.back()
  }

  updateSaveFunction(index: number) {
    console.log(index, this.saveFunc[index]);
  }

  save() {
    console.log(this.saveFunc);
    const intArray = this.saveFunc.map((str: string) => parseInt(str, 10));
    const dataString = JSON.stringify(intArray);
    localStorage.setItem("function.pos", dataString);
    const body = {
      saveFunc : dataString,
    }
    this.http.post<any>(environment.api+"setting/saveFunc",body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
      },
      error =>{
        console.log(error);
      }
    )

  }
}
