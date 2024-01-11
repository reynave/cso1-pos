import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxCurrencyDirective } from "ngx-currency";
import { PaymentVoucherComponent } from './payment-voucher/payment-voucher.component';
import { DiscountBillComponent } from './discount-bill/discount-bill.component';
import { ModalPasswordComponent } from '../global/modal-password/modal-password.component';
import { EdcMandiriComponent } from './edc-mandiri/edc-mandiri.component';

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
  @ViewChild('formRow') rows: ElementRef | any;
  kioskUuid: any;
  password: string = "";
  barcode: string = "";
  note: string = "";
  varkioskUuid: string = "kioskUuid";
  items: any = [];
  terminalId: any;
  transactionId: string = "";
  paymentMethodDetail: any = [];
  paymentMethod: any = [];
  lock: boolean = true;
  payment: any = new Payment("", 0, "", "", "");
  total: any = {
    bill: 0,
    paid: 0,
    remaining: 0,
  };
  user: any = {
    id: '',
    password: '',
    terminalId : '',
  }
  selectPaymentName : any = false;
  callCursor: any;
  member: string = "";
  ilock: string = '1';
  promo_fixed: any = [];
  kioskPaid: any = [];
  paymentName: any = [];
  close: boolean = false;
  edc : any = [];
  voucherCode: string = "";
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private rounter: Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
 
  ngOnInit() {
    this.setCursor();
    this.kioskUuid = this.activatedRoute.snapshot.queryParams['kioskUuid'];
    this.httpCart();
    this.httpPaymentMethod();
    this.httpPaymentInvoice();
    this.terminalId = localStorage.getItem("terminalId");
    this.user.terminalId = localStorage.getItem("terminalId"); 
  }

  setCursor() {
    this.callCursor = setInterval(() => {
      this.rows.nativeElement.focus();
      // console.log( new Date().getSeconds())
    }, 300);
  }

  ngOnDestroy() {
    clearInterval(this.callCursor);
  }

  backSpace() {
    this.barcode = this.barcode.slice(0, -1); // Remove the last character
  }

  addBarcode() {
    console.log(this.barcode);
    const body = {
      barcode: this.barcode,
      kioskUuid: this.kioskUuid
    }
    this.http.post<any>(environment.api + "payment/addBarcode", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        if (data['reload'] == true) {
          this.httpCart();
          this.httpPaymentMethod();
          this.httpPaymentInvoice(); 
        }

        if (data['action'] == 'openPassword') {
          this.barcode = "";
          clearInterval(this.callCursor);
          this.user.id = data['post']['barcode'];
          console.log(this.user);
          const modalRef = this.modalService.open(ModalPasswordComponent);
          modalRef.result.then(
            (result) => {
              //clearInterval(this.callCursor);
              console.log('   clearInterval(this.callCursor); ');
            },
            (reason) => {
              console.log('CLOSE 1001'); 
              this.setCursor();
            },
          );
          modalRef.componentInstance.kioskUuid = this.kioskUuid;

          modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
            console.log('modalRef.componentInstance.newItemEvent', data);
            this.user.password = data['md5'];

            console.log(this.user);

            this.http.post<any>(environment.api+"login/authorization",this.user,{
              headers:this.configService.headers(),
            }).subscribe(
              data=>{
                console.log(data);
                if(data['id'] != ""){
                  this.lock = false;
                }else{
                  alert("WRONG PASSWORD!");
                }
                
              },
              error=>{
                console.log(error);
              }
            )

          });
        }

        if (data['error'] == true) {
          alert(data['note']);
        }
        this.barcode = "";
      },
      error => {
        console.log(error);
      }
    )
  }
  closeAdmin(){
    this.lock = true;
  }
  addVoucher() {
    // console.log(this.voucherCode);
    // const body = {
    //   voucherCode: this.voucherCode,
    //   kioskUuid: this.kioskUuid,
    // }
    // this.http.post<any>(environment.api + "voucher/addVoucher", body, {
    //   headers: this.configService.headers(),
    // }).subscribe(
    //   data => {
    //     console.log(data);
    //     if (data['error'] == false) {
    //       this.voucherCode = "";
    //       this.modalService.dismissAll();
    //       this.sendReload();
    //       this.httpPaymentInvoice();
    //     } else {
    //       alert(data['note']);
    //     }
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // )

  }

  fnVoucherAC() {
    this.voucherCode = "";
  }

  sendReload() {
    const msg = {
      to: 'visitor',
      msg: 'payment method',
      action: 'cart',
      kioskUuid: this.kioskUuid
    }
    this.configService.sendMessage(msg);
    console.log("sendReload");
  }

  httpCart() {
    this.sendReload();
    this.http.get<any>(environment.api + "cart/index?step=payment", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        this.member = data['member'];
        this.ilock = data['ilock'];
        console.log('httpCart', data);
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
        this.paymentName = data['paymentName'];
        this.edc = data['edc'];
        console.log("httpPaymentMethod", data);
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
        console.log('payment/invoice', data);
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


  fnSelectPaymentName(item: any){
    console.log(item);
    this.selectPaymentName = item;
  }

  // open(content: any, x: any, _size: string = 'lg') {
  //   this.paymentMethodDetail = x;
    
  //   this.modalService.open(content, { size: _size });
  //   // this.setCursor();
  // }

  openComponentEdc(item:any){
      console.log(item, this.total, this.kioskUuid); 
      if(item['id'] =="EDC_MANDIRI"){
        clearInterval(this.callCursor);
        const modalRef = this.modalService.open(EdcMandiriComponent, {size:'lg'});
        modalRef.componentInstance.paymentMethodDetail = item;
        modalRef.componentInstance.total = this.total;
        modalRef.componentInstance.kioskUuid = this.kioskUuid; 
        modalRef.result.then(
          (result) => {
            //clearInterval(this.callCursor);
            console.log('   clearInterval(this.callCursor); ');
          },
          (reason) => {
            console.log('CLOSE 1001'); 
            this.setCursor();
            
          },
        );

        modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
          console.log(data);
          this.httpCart();
          this.httpPaymentMethod();
          this.httpPaymentInvoice(); 
        });
      }

      
  }

  open(content: any, string: any, _size: string = 'lg') { 
    this.selectPaymentName = false;
    this.showApprovedCode = false;
    this.approvedCode = "";
    this.payment.amount = 0;
    let index = this.paymentMethod.findIndex((x: { id: string; }) => x.id === string); 
    this.paymentMethodDetail = this.paymentMethod[index]; 
    this.modalService.open(content, { size: _size });
    // this.setCursor();
  }

  openPaymentStatic() {
   // this.modalService.open(content, { size: _size });
    // this.setCursor();
  }


  openComponentVoucher() {
    const modalRef = this.modalService.open(PaymentVoucherComponent, { size: 'md' });
    modalRef.componentInstance.kioskUuid = this.kioskUuid;

    modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
      console.log('modalRef. openComponentVoucher', data);
      this.modalService.dismissAll();
      this.sendReload();
      this.httpCart();
      this.httpPaymentMethod();
      this.httpPaymentInvoice();
      //  this.setCursor(); 
    });
  }


  openDiscountBill() {
    if (this.lock == false) {


      const modalRef = this.modalService.open(DiscountBillComponent, { size: 'lg' });
      modalRef.result.then(
        (result) => {
          //clearInterval(this.callCursor);
          console.log('   clearInterval(this.callCursor); ');
        },
        (reason) => {
          console.log('CLOSE');
        },
      );
      modalRef.componentInstance.activeCart = {
        price: this.total.bill - this.total.paid,
      };
      modalRef.componentInstance.kioskUuid = this.kioskUuid;
      modalRef.componentInstance.discountBill = true;

      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('modalRef.componentInstance.newItemEvent', data);
        this.sendReload();
        this.httpCart();
        this.httpPaymentMethod();
        this.httpPaymentInvoice();
      });
    }else{
      alert("SUPERVISOR REQUIRED");
    }
  }


  addAmount(val: string) {
    let amount: number = 0;
    let tempAmount = this.payment.amount.toString();
    this.payment.amount = Number.parseInt(tempAmount + val);
  }

  addvalueApproveCode(val: string) { 
    
    let tempAmount = this.approvedCode;
    this.approvedCode = tempAmount + val;
    console.log(this.approvedCode );
  }
  paymentCutLastOne2(){
    let tempAmount = this.approvedCode.slice(0, -1); 
    this.approvedCode = tempAmount;
    console.log(this.approvedCode );
  }

  paymentCutLastOne() {
    let tempAmount = this.payment.amount.toString().slice(0, -1);
    let amount = Number.parseInt(tempAmount);
    this.payment.amount = (Number.isNaN(amount)) ? 0 : amount;
  }
  showApprovedCode : boolean = false;
  approvedCode : string = "";
  onSubmitPayment() {
    const body = {
      payment: this.payment,
      kioskUuid: this.kioskUuid,
      paymentMethodDetail: this.paymentMethodDetail,
      changes: this.fnChangeBill(),
      terminalId: this.terminalId,
      paymentNameId : this.selectPaymentName.id,
      approvedCode : this.approvedCode,

    }
    console.log(body);
    this.http.post<any>(environment.api + "payment/onSubmitPayment", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log('onSubmitPayment', data);
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
      console.log("isCloseTransaction", this.close);
      this.http.get<any>(environment.api + "payment/isCloseTransaction", {
        headers: this.configService.headers(),
        params: {
          kioskUuid: this.kioskUuid,
          terminalId: this.terminalId,
          accountId: this.configService.account()['account']['id'],
        }
      }).subscribe(
        data => {
          console.log('isCloseTransaction subscribe', data);
          this.note = data['note'];
          this.transactionId = data['transactionId'];
          // http://localhost:4200/#/printing?id=T02.230828.0004
          this.rounter.navigate(['printing'], { queryParams: { id: data['transactionId'] } });
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
    return a < 0 ? a * -1 : a;
  }

  paymentAdd(val: number) {
    this.payment.amount = this.payment.amount + val;
  }

  paymentAC() {
    this.payment.amount = 0;
  }
  paymentAC2() {
    this.approvedCode = '';
  }

  back() {
    history.back();
  }
}
