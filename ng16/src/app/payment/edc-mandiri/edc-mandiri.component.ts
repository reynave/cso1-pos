import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';
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
  selector: 'app-edc-mandiri',
  templateUrl: './edc-mandiri.component.html',
  styleUrls: ['./edc-mandiri.component.css']
})
export class EdcMandiriComponent implements OnInit, OnDestroy {
  @ViewChild('formRow') rows: ElementRef | any;
  @Input() kioskUuid: any;
  @Input() total: any;
  @Input() paymentMethodDetail: any;

  @Output() newItemEvent = new EventEmitter<string>();
  com: string = "";
  voucherCode: string = "";
  selectPayment: boolean = false;
  selectPaymentName: any = false;
  paymentName: any = [];
  callCursor: any;
  paymentMethod: any = [];
  showApprovedCode: boolean = false;
  approvedCode: string = "";
  paidrRefCode : string = "";
  payment: any = new Payment("", 0, "", "", "");
  note: string = ">> Send to EDC MANDIRI...";
  private _docSub: any;
  constructor(
    public activeModal: NgbActiveModal,
    private configService: ConfigService,
    private http: HttpClient,

  ) { }

  ngOnInit(): void {
    //this.setCursor();
    this.payment.amount = this.total.remaining;
    this.httpPaymentMethod();
    this._docSub = this.configService.getMessage().subscribe(
      (data: { [x: string]: any; }) => {
        console.log(data);
        this.note += "\n>> " + data['name'] + " " + data['message'];


        let strArray = data['message'].split("|")
        let paidAmount = strArray[strArray.length - 1];
        let paidApprovedCode = strArray[strArray.length - 2];
        let paidrRefCode = strArray[strArray.length - 3];

        console.log(paidAmount, paidApprovedCode, paidrRefCode);

        if (paidApprovedCode !== undefined) {
        
          if (paidApprovedCode.length > 3) {
            console.log("SUCCESS");
            this.approvedCode = paidApprovedCode;
            this.paidrRefCode = paidrRefCode;
            this.note += "\n>> APPROVED CODE " + paidApprovedCode;
            this.onSubmitDebug();
            this.onSubmitPayment();

          } else {
            this.approvedCode = "FAILED";
            console.log("FALL");
            this.note += "\n>> PAID FAIL"; 
            this.onSubmitDebug();
          }
  
        }

      }
    );
  }

  httpPaymentMethod() {
    this.http.get<any>(environment.api + "payment/method", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        this.paymentMethod = data['items'];
        this.paymentName = data['paymentName'];
        console.log("httpPaymentMethod", data);
      },
      error => {
        console.log(error);

      }
    )
  }
  ngOnDestroy(): void {
    clearInterval(this.callCursor);
    console.log('ngOnDestroy callCursor')
  }

  setCursor() {
    this.callCursor = setInterval(() => {
      this.rows.nativeElement.focus();
    }, 300);
  }

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  close() {
    this.activeModal.dismiss();
  }

  fnMaxAmount() {
    if (this.payment.amount > this.total.remaining) {
      this.payment.amount = this.total.remaining;
      alert("Max Amount " + this.total.remaining);
    }
  }

  fnSelectPaymentName(item: any) {
    console.log(item);
    this.selectPaymentName = item;
  }

  addAmount(val: string) {
    let amount: number = 0;
    let tempAmount = this.payment.amount.toString();
    this.payment.amount = Number.parseInt(tempAmount + val);
    this.fnMaxAmount();
  }

  paymentCutLastOne() {
    let tempAmount = this.payment.amount.toString().slice(0, -1);
    let amount = Number.parseInt(tempAmount);
    this.payment.amount = (Number.isNaN(amount)) ? 0 : amount;
  }

  paymentAC() {
    this.payment.amount = 0;
  }

  paymentAdd(val: number) {
    this.payment.amount = this.payment.amount + val;
    this.fnMaxAmount();
  }

  fnChangeBill() {
    let a = ((this.total.bill - (this.total.paid + this.payment.amount)) < 0 ? (this.total.bill - (this.total.paid + this.payment.amount)) : 0);
    return a < 0 ? a * -1 : a;
  }

 
  sendToEDC() {
    this.showApprovedCode = true;
  
    let amount = String(this.payment.amount).padStart(12, '0');
    const msg = {
      to: 'ERC',
      msg: this.paymentMethodDetail['id'],
      amount: amount,
      com: this.paymentMethodDetail['com'],
      action: 'writeECR',
    }

    this.configService.sendMessage(msg);
    console.log(msg);
  }

  onSubmitPayment() {
    const body = {
      payment: this.payment,
      kioskUuid: this.kioskUuid,
      paymentMethodDetail: this.paymentMethodDetail,
      changes: this.fnChangeBill(),
      paymentNameId: this.selectPaymentName.id,
      approvedCode: this.approvedCode,  
      paidrRefCode : this.paidrRefCode,
    }

    console.log(body);
    this.http.post<any>(environment.api + "payment/onSubmitPayment", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log('onSubmitPayment', data);
        this.addNewItem("reload");
        this.activeModal.dismiss();
      },
      error => {
        console.log(error);
      }
    )
  }

  onSubmitDebug() {
    const body = {
      kioskUuid: this.kioskUuid, 
      note: this.note,  
    }
    console.log(body);
  
    this.http.post<any>(environment.api + "Logs/index", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log('onSubmitDebug',data); 
      },
      error => {
        console.log(error);
      }
    )
  }

}
