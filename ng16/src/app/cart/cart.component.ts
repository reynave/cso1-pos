import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ItemsComponent } from '../items/items.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  @ViewChild('formRow') rows: ElementRef | any;
  @ViewChild('formPassword') formPassword: ElementRef | any;
  
  @ViewChild('contentPassword') contentPassword : any;
  password : string = "";
  barcode: string = "";
  callServer: any;
  varkioskUuid: string = "kioskUuid";
  kioskUuid: any;
  supervisorMode : boolean = false;
  items: any = [];
  cart: any = [];
  newItem: any = [];
  alert : boolean = false;
  func: any = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
  ]
  listNumber = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00'];
  addQty: string = "";
  item: any = [];
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.supervisorMode = false;
    this.newItem = [];
    //this.callHttpServer();
    this.checkKioskUuid();
    this.httpCart();
    //console.log(this.configService.account()); 
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

  checkKioskUuid() {
    if (localStorage.getItem(this.varkioskUuid) == undefined || localStorage.getItem(this.varkioskUuid) == "") {
      this.configService.getKioskUuid().subscribe(
        data => {
          console.log(data);
          if (data['error'] === false) {
            localStorage.setItem(this.varkioskUuid, data['id']);
            this.kioskUuid = data['id'];
          }
        },
        error => {
          console.log(error);
        }
      )
      console.log("id kiosk INSERT");
    } else {
      console.log("id kiosk ada");
      this.kioskUuid = localStorage.getItem(this.varkioskUuid);
    }
  }

  callHttpServer() {
    this.callServer = setInterval(() => {
      this.rows.nativeElement.focus();
    }, 300);
  }

  ngOnDestroy() {
    clearInterval(this.callServer);
    //  this._docSub.unsubscribe();
  }

  addToCart() {
    this.alert =  false;
    const body = {
      barcode: this.barcode,
      kioskUuid: this.kioskUuid,
      qty: 1,
    }
    this.http.post<any>(environment.api + "Cart/addToCart", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        
        this.newItem = data['item']; 
      
        if(data['error'] == false ){
          if(data['result'] == 'SUPERVISOR'){ 
       
            this.modalService.open(this.contentPassword,{size:'md'});
       
          }
          else if(data['result'] == 'ITEMS'){
            this.alert =  true;
            this.httpCart();
            this.barcode = "";
          }else{
            this.barcode = "";
            this.alert =  true;
            this.newItem = {
              barcode : this.barcode,
              description : "ITEM TIDAK DI TEMUKAN!",
            } 
          }
        }
     
      },
      error => {
        this.newItem = {
          barcode : this.barcode,
          description : "ITEM TIDAK DI TEMUKAN!",
        }
        this.barcode = "";
        console.log(error);
      }
    )
 
  }

  open(content: any, item: any) {
    this.addQty = '0';
    this.item = item;
    this.modalService.open(content);
  }

  checkNumber() {
    this.addQty = parseInt(this.addQty).toString();
    if (parseInt(this.addQty) < 1) {
      this.addQty = "";
    }

  }
 
  fnAddQty(number: string) {

    this.addQty += number;
    this.checkNumber();
  }

  onSubmitQty(){
    const body ={
      kioskUuid: this.kioskUuid,
      item : this.item,
      addQty : this.addQty
    }
 
    this.http.post<any>(environment.api + "Cart/onSubmitQty", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        this.addQty  = '0'; 
        console.log(data); 
        this.modalService.dismissAll();
        this.httpCart();
      },
      error => {
        console.log(error);
      }
    )
  }

  openComponent(comp : any ) {
		const modalRef = this.modalService.open(ItemsComponent, {size:'lg'});
		modalRef.componentInstance.name = 'World';
    console.log(modalRef);
    modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
      console.log('modalRef.componentInstance.newItemEvent',data); 
      this.httpCart();
    });
 
	}


  fnAdminSubmit(){
    this.supervisorMode = false;
    this.alert =  false;
    const body = {
      barcode: this.barcode,
      kioskUuid: this.kioskUuid, 
      password : this.password
    }
    this.http.post<any>(environment.api + "Cart/fnAdminSubmit", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);  
        if(data['id'] == this.barcode){
          this.supervisorMode = true;
          this.barcode = "";
          this.modalService.dismissAll();
        }else{
          alert("WRONG PASSWORD!");
     
        }
        this.password = "";

      },
      error => { 
        console.log(error);
      }
    )
  }
}
