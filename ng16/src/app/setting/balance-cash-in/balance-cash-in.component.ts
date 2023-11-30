import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-balance-cash-in',
  templateUrl: './balance-cash-in.component.html',
  styleUrls: ['./balance-cash-in.component.css']
})
export class BalanceCashInComponent implements OnInit {
  items: any = [];
  total :  number = 0;
  cashIn: string = '0';
  totalCashIn : string = "";
  totalCashOut : string = "";
  startBalance : string = "";
  startDate : string = "";
  loading : boolean = true;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit(): void {
    this.httpGet();
  }

  httpGet() {
    this.loading = true;
    this.http.get<any>(environment.api + "balance/index", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        this.loading = false;
        console.log(data);
        this.items = data['items'];
        this.totalCashIn = data['cashIn'];
        this.totalCashOut = data['cashOut'];
        this.startBalance = data['startBalance'];
        this.startDate = data['startDate'];
        this.total = data['total'];
      },
      error => {
        console.log(error);
      }
    )
  }
  
  onCashIn() {
    if (parseInt(this.cashIn) > 0) {
      const body = {
        cashIn: this.cashIn,
        terminalId : localStorage.getItem("terminalId"),
      }
      this.http.post<any>(environment.api + "balance/onCashIn", body, {
        headers: this.configService.headers(),
      }).subscribe(
        data => {
          console.log(data);
          this.httpGet();
          this.cashIn = '0';
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  back(){
    history.back();
  }

  addNumber(newItem:any){
     
    console.log(newItem);
   
    if(newItem == 'BS'){
      this.cashIn = this.cashIn.slice(0, -1);
    }
    else if(newItem == 'AC'){
      this.cashIn =  '';
    }
    else if(newItem == 'ENTER'){
      if(this.cashIn != ""){ 
        this.onCashIn();
        this.cashIn =  '';
      } 
    }
    else{
      if(parseInt(this.cashIn) <= 0){
        this.cashIn =  newItem;
      }else{
        this.cashIn = this.cashIn + newItem;
      }
      
    }

   
  }
}
