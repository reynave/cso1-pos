import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CashierService {

  constructor() { }

  openCashDrawer(){
    console.log("openCashDrawer.OPEN()");
  }
}
