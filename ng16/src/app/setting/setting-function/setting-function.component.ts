import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-setting-function',
  templateUrl: './setting-function.component.html',
  styleUrls: ['./setting-function.component.css']
})
export class SettingFunctionComponent {
  @ViewChild('item') item!: ElementRef;

  items = Array.from({ length: 12 }).map((_, i) => i);
  saveFunc: any = [];
  constructor() {
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
  }
}
