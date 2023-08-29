import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap'; 
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-visitor',
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css']
})
export class VisitorComponent implements OnInit, OnDestroy  {
  private _docSub: any; 
  barcode: string = "";
  callServer: any;
  varkioskUuid: string = "kioskUuid";
  kioskUuid: string = "";
  transactionId : string = "";
  supervisorMode: boolean = false;
  items: any = [];
  cart: any = [];
  newItem: any = [];
  alert: boolean = false;
  total: any = {
    bill: 0,
    paid: 0,
    remaining: 0,
  };
  kioskPaid: any = [];
  summary :any = [];
  paymentMethod : any = [];
  close: boolean = false;
  balance : any = [];
  action : string = "home";
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router : Router,
    private activatedRoute : ActivatedRoute,
    private modalService: NgbModal,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this._docSub = this.configService.getMessage().subscribe(
      (data: { [x: string]: any; }) => {
        console.log(data);
        this.kioskUuid = data['kioskUuid']; 
        this.transactionId = data['transactionId'];
        this.action = data['action'];
        if(data['kioskUuid'] === undefined){
          this.httpBill();
        }else{
          this.httpItem();
          this.httpPaymentInvoice();
        }
        
      }
    );
  }

  httpItem(){
    console.log(this.kioskUuid);
     console.log(this.transactionId);
    
    this.http.get<any>(environment.api + "cart/index", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        this.items = data['items'];   
        console.log(data);
      },
      error => {
        console.log(error);
      }
    )
  }

 
  httpPaymentInvoice() {
    this.http.get<any>(environment.api + "payment/invoice", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid
      }
    }).subscribe(
      data => {
        this.total = data['total'];
        this.kioskPaid = data['kioskPaid'];
        this.close = data['close'];
        this.isCloseTransaction();
        console.log(data);
      },
      error => {
        console.log(error);
      }
    )
  }


  httpBill() {
    this.http.get<any>(environment.api + "printing/detail", {
      headers: this.configService.headers(),
      params: {
        id: this.transactionId,
      }
    }).subscribe(
      data => { 
        console.log('httpBill',data);
        this.balance = data['balance'];
        this.items = data['items']; 
        this.paymentMethod = data['paymentMethod'];
        this.summary = data['summary'];
      },
      error => {
        console.log(error);
      }
    )
  }


  isCloseTransaction(){

  }

  ngOnDestroy(): void {
   this._docSub.unsubscribe();
  }
}
