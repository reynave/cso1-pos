import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from '../service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  @Input() kioskUuid : any;
  @Input() exchange : any;
  @Input() qty : any;
  
  @Output() newItemEvent = new EventEmitter<string>();
  search : string = "";
  items : any = [];
  isSearch : boolean =false;
  loading : boolean = false;
  totalExchange : number = 0;
	constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public configService : ConfigService,
    public http : HttpClient
  ) {}
  ngOnInit(): void {
    // setTimeout(()=>{
    //   this.search = "";
    // },100); 
    // this.fnExchange();
  }

  fnExchange(){ 
    this.exchange.forEach((el: any) => {
      if(el['checkbox'] == true){
        this.totalExchange += Number(el['price']);
      }
    });
  }
  

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  httpSearchItem(){
    this.loading = true;
    const body = {
      search : this.search
    }
    this.http.get<any>(environment.api+"items/index",{
      headers : this.configService.headers(),
      params : {
        search : this.search
      }
    }).subscribe(
      data=> {
        this.loading = false;
        console.log(data);
        this.isSearch = true;
        this.items = data['items'];
      },
      error=>{
        console.log(error);
      }
    )
  }
  
  addToCart(x:any){
    this.loading = true;
    const body = {
      item : x,
      barcode : x.barcode,
      kioskUuid : this.kioskUuid,
      terminalId : localStorage.getItem("terminalId"),
      totalExchange : this.totalExchange,
      qty : this.qty,
    }
    console.log(body);
    if(this.kioskUuid == 'exchange'){
      this.http.post<any>(environment.api+"cart/exchange",body,{
        headers : this.configService.headers(), 
      }).subscribe(
        data=> {
          console.log(data);
          this.loading = false;
          this.modalService.dismissAll();
          this.addNewItem(data);
        },
        error=>{
          console.log(error);
        }
      )
    }else{
      this.http.post<any>(environment.api+"cart/addToCart",body,{
        headers : this.configService.headers(), 
      }).subscribe(
        data=> {
          console.log(data);
          this.loading = false;
          this.modalService.dismissAll();
          this.addNewItem('add new item');
        },
        error=>{
          console.log(error);
        }
      )
    }
    
  }
  close(){
    this.modalService.dismissAll();
  }

 
}
