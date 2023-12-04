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
  selector: 'app-payment-voucher',
  templateUrl: './payment-voucher.component.html',
  styleUrls: ['./payment-voucher.component.css']
})
export class PaymentVoucherComponent implements OnInit, OnDestroy {
  @ViewChild('formRow') rows: ElementRef | any;
  @Input() kioskUuid: any;  
  @Output() newItemEvent = new EventEmitter<string>();

  voucherCode : string = "";
  
  paymentMethodDetail: any = [];
  paymentMethod: any = [];
  payment: any = new Payment("", 0, "", "", "");

	constructor(
      public activeModal: NgbActiveModal,
      private configService : ConfigService,
      private http:HttpClient,

  ) {}
 
  ngOnInit(): void {
    this.setCursor();
  }
  ngOnDestroy(): void {
    clearInterval(this.callCursor); 
    console.log('ngOnDestroy callCursor')
  }

  callCursor :any;
  setCursor() {
    this.callCursor = setInterval(() => {
      this.rows.nativeElement.focus();
    }, 300);
  }

  addVoucher(){
    console.log(this.voucherCode);
    const body = {
      voucherCode : this.voucherCode,
      kioskUuid : this.kioskUuid,
    }
    this.http.post<any>(environment.api+"voucher/addVoucher",body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
        if(data['error'] == false){
          this.voucherCode = "";
        //  this.activeModal.dismiss(); 
          console.log('onSubmitPayment',data); 
          this.addNewItem("reload");
        }else{
          alert(data['note']);
        }
        
      },
      error=>{
        console.log(error);
      }
    )

  }

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  fnVoucherAC(){
    this.voucherCode = "";
  }

   
}
