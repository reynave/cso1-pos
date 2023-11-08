import { Component } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-key-num',
  templateUrl: './key-num.component.html',
  styleUrls: ['./key-num.component.css']
})
export class KeyNumComponent {
  @Output() newItemEvent = new EventEmitter<string>();

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  addAmount(val:string){
   // console.log(val);
    this.addNewItem(val);
  }
}
