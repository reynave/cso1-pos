import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

export class Payment {

  constructor(
    public paymentMethodId: string,
    public amount: string,
    public deviceId: string,
    public externalTransId: string,
    public cardId: string,
  ) { }

}
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  kioskUuid: any;
  note : string = "";
  varkioskUuid: string = "kioskUuid";
  items: any = [];
  terminalId : any;
  transactionId : string = "";
  paymentMethodDetail: any = [];
  paymentMethod: any = [];
  payment: any = new Payment("", "", "", "", "");
  total: any = {
    bill: 0,
    paid: 0,
    remaining: 0,
  };
  kioskPaid: any = [];
  close : boolean = false;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private activatedRoute : ActivatedRoute,
    private modalService: NgbModal,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
    this.kioskUuid = this.activatedRoute.snapshot.queryParams['kioskUuid'];
    this.httpCart();
    this.httpPaymentMethod();
    this.httpPaymentInvoice();
    this.terminalId = localStorage.getItem("terminalId");
  }

  httpCart() {
    this.http.get<any>(environment.api + "cart/index", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        this.items = data['items'];

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

  onSubmitPayment() {
    const body = {
      payment: this.payment,
      kioskUuid: this.kioskUuid,
      paymentMethodDetail: this.paymentMethodDetail,
    }
    console.log(body);
    if (this.total.bill - (this.total.paid + this.payment.amount) < 0) { 
      alert("angka yang anda masukan salah atau melebihi total tagiahan !");
      this.payment.amount = this.total.bill - (this.total.paid);
    }else{
      this.http.post<any>(environment.api + "payment/onSubmitPayment", body, {
        headers: this.configService.headers(),
      }).subscribe(
        data => {
          console.log(data);
          this.httpPaymentInvoice();
          this.modalService.dismissAll();
          this.payment.amount = 0;
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  isCloseTransaction(){
    if(this.close === true){
      console.log("isCloseTransaction");
      
      this.http.get<any>(environment.api + "payment/isCloseTransaction",{
        headers: this.configService.headers(), 
        params : {
          kioskUuid : this.kioskUuid,
          terminalId : this.terminalId,
        }
      }).subscribe(
        data => { 
          console.log(data);
          this.note = data['note'];
          this.transactionId = data['transactionId'];
        },
        error => {
          console.log(error);
        }
      )
    }
  }
}
