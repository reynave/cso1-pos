import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment'; 
import {  Router } from '@angular/router'; 

@Component({
  selector: 'app-printing-history',
  templateUrl: './printing-history.component.html',
  styleUrls: ['./printing-history.component.css']
})
export class PrintingHistoryComponent implements OnInit{
  id: string = "";
  note: string = "";
  items: any = [];
  outputPrint: string = "";
  copy: number = 0;
  constructor(
    private configService: ConfigService,
    private http: HttpClient, 
    private router : Router, 
  ) {}

  ngOnInit() {
      this.httpGet();
  }

  httpGet(){
    this.http.get<any>(environment.api+"printing/index",{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
        this.items = data['items'];
      },
      error=>{
        console.log(error);
      }
    )
  }


  back(){
    history.back();
  }
  

}
