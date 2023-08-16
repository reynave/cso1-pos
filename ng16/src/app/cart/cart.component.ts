import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  @ViewChild('formRow') rows: ElementRef | any;
  barcode: string = "";
  callServer: any;
  varkioskUuid: string = "kioskUuid";
  kioskUuid: any;
  items: any = [];
  cart: any = [];
  newItem: any = [];
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

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
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
        console.log(data);
        this.items = data['items'];
        console.log(this.cart);
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
        this.barcode = "";
        this.newItem = data['item'];
        this.httpCart();
      },
      error => {
        console.log(error);
      }
    )
    console.log(this.barcode);
  }
  item: any = [];
  open(content: any, item: any) {
    this.addQty = '0';
    this.item = item;
    this.modalService.open(content);
  }

  addQty: string = "";
  checkNumber() {
    this.addQty = parseInt(this.addQty).toString();
    if (parseInt(this.addQty) < 1) {
      this.addQty = "";
    }

  }
  listNumber = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00'];
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
}
