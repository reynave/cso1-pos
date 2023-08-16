import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent  implements OnInit{
  terminalId : any;

  constructor(
    private configService : ConfigService
  ){}

  ngOnInit(): void {
    this.terminalId = localStorage.getItem("terminalId");
  }
 
  fnSave(){
    console.log(this.terminalId);
    localStorage.setItem("terminalId",this.terminalId); 
  }
  back(){
    history.back();
  }
}
