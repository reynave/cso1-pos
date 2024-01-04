import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-discount-manual',
  templateUrl: './discount-manual.component.html',
  styleUrls: ['./discount-manual.component.css']
})
export class DiscountManualComponent implements OnInit{
  @Input() activeCart: any;
  @Input() kioskUuid: any; 

  @Output() newItemEvent = new EventEmitter<string>();
 
  isSearch: boolean = false; 
  loading: boolean = false; 
  newPrice : number  = 0;
  barcode : string = "";
  typeOfDisc : string = '1';
  newDiscount : number = 0;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public configService: ConfigService,
    public http: HttpClient
  ) { }
  ngOnInit(): void {
    this.newPrice = this.activeCart.price; 
    console.log(this.activeCart, this.kioskUuid);
  }

  fnSelectDisc(type:string){
    this.typeOfDisc = type;
    this.fnCheckInputDisc();
  }
  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  close() {
    this.modalService.dismissAll();
  } 

  reset(){
    this.newDiscount = 0 ;
  }

  
  addAmount(val : string){
    let amount : number = 0;
    let tempAmount = this.newDiscount.toString();  
    this.newDiscount = Number.parseInt(tempAmount+val);

    this.fnCheckInputDisc();
  }
  
  paymentCutLastOne(){
    let tempAmount = this.newDiscount .toString().slice(0, -1);  
    let amount = Number.parseInt(tempAmount);

    this.newDiscount  = (Number.isNaN(amount)) ? 0 : amount ;
  }
  paymentAdd(val : number){
    this.newDiscount  = this.newDiscount  + val;
    this.fnCheckInputDisc();
  } 

  fnCheckInputDisc(){
    let d = 0;
    if(this.typeOfDisc == '1'){
      if(this.newDiscount >  99){
        this.newDiscount = 99;
      }
      d = this.activeCart.price * ((this.newDiscount )/100);
    }
    else if (this.typeOfDisc == '2'){
      if(this.newDiscount > this.activeCart.price){
        this.newDiscount = this.activeCart.price;
      }
      d = this.newDiscount;
    }

    this.newPrice = this.activeCart.price -  d;
  }


  paymentAC(){
    this.newDiscount  = 0;
  } 
  changePrice(){
    const body = {
      activeCart : this.activeCart,
      kioskUuid : this.kioskUuid,
      newPrice : this.newPrice,
      typeOfDisc : this.typeOfDisc,
      discountAmount : this.activeCart.price - this.newPrice,
    }
    console.log(body);
    this.http.post<any>(environment.api+"cart/discountManual",body,{
      headers:this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data); 
        this.addNewItem("reload");
        this.modalService.dismissAll();
      },
      error=>{
        console.log(error);
      } 
    )
  }
} 
