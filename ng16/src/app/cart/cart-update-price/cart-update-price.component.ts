import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart-update-price',
  templateUrl: './cart-update-price.component.html',
  styleUrls: ['./cart-update-price.component.css']
})
export class CartUpdatePriceComponent implements OnInit {
  @Input() activeCart: any;
  @Input() kioskUuid: any; 

  @Output() newItemEvent = new EventEmitter<string>();
 
  isSearch: boolean = false; 
  loading: boolean = false;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public configService: ConfigService,
    public http: HttpClient
  ) { }
  ngOnInit(): void {
    this.activeCart.price= 0;
    console.log(this.activeCart, this.kioskUuid);
  }

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  close() {
    this.modalService.dismissAll();
  } 

  
  addAmount(val : string){
    let amount : number = 0;
    let tempAmount = this.activeCart.price.toString();  
    this.activeCart.price = Number.parseInt(tempAmount+val);
  }
  
  paymentCutLastOne(){
    let tempAmount = this.activeCart.price.toString().slice(0, -1);  
    let amount = Number.parseInt(tempAmount);

    this.activeCart.price = (Number.isNaN(amount)) ? 0 : amount ;
  }
  paymentAdd(val : number){
    this.activeCart.price = this.activeCart.price + val;
  } 

  paymentAC(){
    this.activeCart.price = 0;
  } 
  updatePrice(){
    const body = {
      activeCart : this.activeCart,
      kioskUuid : this.kioskUuid
    }
    console.log(body);
    this.http.post<any>(environment.api+"cart/updatePrice",body,{
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
