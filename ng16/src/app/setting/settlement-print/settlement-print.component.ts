import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { PrintingService } from 'src/app/service/printing.service';

@Component({
  selector: 'app-settlement-print',
  templateUrl: './settlement-print.component.html',
  styleUrls: ['./settlement-print.component.css']
})
export class SettlementPrintComponent implements OnInit {
  item: any = [];
  id: string = "";
  balance : any = [];

  cso1_transaction : any = [];
  cso2_settlement : any = [];
  cso2_balance : any = [];
  outputPrint:string = "";
  constructor(
    private configService: ConfigService,
    private printingService: PrintingService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute

  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.httpGet();
  }
  httpGet() {
    this.http.get<any>(environment.api + "settlement/print", {
      headers: this.configService.headers(),
      params: {
        id: this.id,
      }
    }).subscribe(
      data => {
      
        this.cso1_transaction = data['cso1_transaction'];
        this.cso2_settlement = data['cso2_settlement'];
        this.cso2_balance = data['cso2_balance']; 
        this.outputPrint = this.printingService.settlement(data);
      },
      error => {
        console.log(error);
      }
    )
  }
  back(){
    history.back();
  }
  fnPrint(){ 
    const body = {
      token : '8zrGkEgUfVJM9XfUHuvYBMipLHMBEHES6HKkGqytFYq36h67gE',
      outputPrint  : this.outputPrint,
      cashdrawer : 0,
    }
    this.http.post<any>(environment.api+"settlement/fnPrint", body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);  
      },
      error=>{
        console.log(error);
        alert("Printer thermal connection failed.")
      }
    )  
  }

}
