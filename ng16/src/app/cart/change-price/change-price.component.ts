import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-change-price',
  templateUrl: './change-price.component.html',
  styleUrls: ['./change-price.component.css']
})
export class ChangePriceComponent implements OnInit{
  @Input() activeCart: any;
  @Input() kioskUuid: any; 

  @Output() newItemEvent = new EventEmitter<string>();
 
  isSearch: boolean = false; 
  loading: boolean = false; 
  newPrice : number  = 0;
  barcode : string = "";
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

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  close() {
    this.modalService.dismissAll();
  } 

  reset(){
    this.newPrice = this.activeCart.price ;
  }

  
  addAmount(val : string){
    let amount : number = 0;
    let tempAmount = this.newPrice.toString();  
    this.newPrice = Number.parseInt(tempAmount+val);
  }
  
  paymentCutLastOne(){
    let tempAmount = this.newPrice .toString().slice(0, -1);  
    let amount = Number.parseInt(tempAmount);

    this.newPrice  = (Number.isNaN(amount)) ? 0 : amount ;
  }
  paymentAdd(val : number){
    this.newPrice  = this.newPrice  + val;
  } 

  paymentAC(){
    this.newPrice  = 0;
  } 
  changePrice(){
    const body = {
      activeCart : this.activeCart,
      kioskUuid : this.kioskUuid,
      newPrice : this.newPrice,
    }
    console.log(body);
    this.http.post<any>(environment.api+"cart/changePrice",body,{
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
