import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxCurrencyDirective } from "ngx-currency";

export class Payment {

  constructor(
    public paymentMethodId: string,
    public amount: number,
    public deviceId: string,
    public externalTransId: string,
    public cardId: string,
  ) { }

}
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  kioskUuid: any;
  note: string = "";
  varkioskUuid: string = "kioskUuid";
  items: any = [];
  terminalId: any;
  transactionId: string = "";
  paymentMethodDetail: any = [];
  paymentMethod: any = [];
  payment: any = new Payment("", 0, "", "", "");
  total: any = {
    bill: 0,
    paid: 0,
    remaining: 0,
  };
  promo_fixed : any = [];
  kioskPaid: any = [];
  close: boolean = false;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private rounter : Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  private _docSub: any;
  ngOnInit() {
   
    this.kioskUuid = this.activatedRoute.snapshot.queryParams['kioskUuid'];
    this.httpCart();
    this.httpPaymentMethod();
     this.httpPaymentInvoice();
    this.terminalId = localStorage.getItem("terminalId");
  
  }
  ngOnDestroy() { 
    
  }
  sendReload(){
    const msg = {
      to: 'visitor',
      msg: 'payment method',
      action : 'cart',
      kioskUuid : this.kioskUuid
    }
    this.configService.sendMessage(msg);
    console.log("sendReload");
  }

  httpCart() {
    this.sendReload();
    this.http.get<any>(environment.api + "cart/index", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        console.log('httpCart',data);
        this.items = data['items'];
        this.promo_fixed = data['promo_fixed'];
      },
      error => {
        console.log(error);
      }
    )
  }

  httpPaymentMethod() {
    this.http.get<any>(environment.api + "payment/method", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        this.paymentMethod = data['items']; 
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
        console.log('payment/invoice',data);
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
 
  open(content: any, x: any) {
    this.paymentMethodDetail = x;
    this.modalService.open(content, { size: 'lg' });
  }

  addAmount(val : string){
    let amount : number = 0;
    let tempAmount = this.payment.amount.toString();  
    this.payment.amount = Number.parseInt(tempAmount+val);
  }

  paymentCutLastOne(){
    let tempAmount = this.payment.amount.toString().slice(0, -1);  
    let amount = Number.parseInt(tempAmount);

    this.payment.amount = (Number.isNaN(amount)) ? 0 : amount ;
  }

  onSubmitPayment() {
    const body = {
      payment: this.payment,
      kioskUuid: this.kioskUuid,
      paymentMethodDetail: this.paymentMethodDetail,
      changes : this.fnChangeBill(),
      terminalId : this.terminalId,
    }
    console.log(body); 
    this.http.post<any>(environment.api + "payment/onSubmitPayment", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log('onSubmitPayment',data);
        this.httpPaymentInvoice();
        this.modalService.dismissAll();
        this.payment.amount = 0;
        this.sendReload();
      },
      error => {
        console.log(error);
      }
    )
  }

  isCloseTransaction() {
    if (this.close == true) {
      console.log("isCloseTransaction"); 
      this.http.get<any>(environment.api + "payment/isCloseTransaction", {
        headers: this.configService.headers(),
        params: {
          kioskUuid: this.kioskUuid,
          terminalId: this.terminalId,
        }
      }).subscribe(
        data => { 
          console.log('isCloseTransaction',data);
          this.note = data['note'];
          this.transactionId = data['transactionId'];
        // http://localhost:4200/#/printing?id=T02.230828.0004
          this.rounter.navigate(['printing'],{ queryParams:{id : data['transactionId']}} );
          this.sendReload();
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  fnChangeBill() {
    let a = ((this.total.bill - (this.total.paid + this.payment.amount)) < 0 ? (this.total.bill - (this.total.paid + this.payment.amount)) : 0);
    return a < 0 ? a *-1 : a;
  }

  paymentAdd(val : number){
    this.payment.amount = this.payment.amount + val;
  } 
  paymentAC(){
    this.payment.amount = 0;
  }
}
