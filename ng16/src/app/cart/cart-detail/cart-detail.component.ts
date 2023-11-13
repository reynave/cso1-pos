import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from './../../service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart-detail',
  templateUrl: './cart-detail.component.html',
  styleUrls: ['./cart-detail.component.css']
})
export class CartDetailComponent implements OnInit {
  @Input() item: any;
  @Input() kioskUuid: any;
  @Input() totalTebusMurah: number = 0;
  @Input() activeCart: any;

  @Output() newItemEvent = new EventEmitter<string>();
  search: string = "";
  items: any = [];
  isSearch: boolean = false;
  detail: any = [];
  loading: boolean = false;
  addQty: string = "0";
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public configService: ConfigService,
    public http: HttpClient
  ) { }

  ngOnInit() {
    console.log(this.item);
    this.httpGet();
  }

  httpGet() {
    const body = {
      item: this.item,
      kioskUuid: this.kioskUuid,
    }
    this.http.post<any>(environment.api + "cart/detail", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log("cart/detail", data);
        this.detail = data['detail'];
        this.items = data['items'];
      },
      error => {
        console.log(error);
      }
    )
  }

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  voidCart(x: any) {
    const body = {
      item: x,
    }
    console.log(body);
    this.http.post<any>(environment.api + "cart/voidCart", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        let objIndex = this.items.findIndex(((obj: { id: any; }) => obj.id == x.id));
        this.items.splice(objIndex, 1);

        this.addNewItem('void items');
        if (this.items.length < 1) {
          this.close();
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  fnVoidAllCartItems() {
    const body = {
      detail: this.detail,
      kioskUuid: this.kioskUuid,
    }
    console.log(body);
    this.http.post<any>(environment.api + "cart/fnVoidAllCartItems", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.modalService.dismissAll();
        this.addNewItem('update Price items');
      },
      error => {
        console.log(error);
      }
    )
  }


  close() {
    this.modalService.dismissAll();
  }

  fnReduceCart() {
    const body = {
      item: this.activeCart,
      addQty: this.addQty,
      kioskUuid: this.kioskUuid,
    }
    console.log(body);
    this.http.post<any>(environment.api + "cart/fnReduceCart", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.addNewItem('void items');
        this.close();
      },
      error => {
        console.log(error);
      }
    )
  }

  fnAddQty(newItem: any) {
    console.log(newItem);

    if (newItem == 'BS') {
      this.addQty = this.addQty.slice(0, -1);
    }
    else if (newItem == 'AC') {
      this.addQty = '';
    }
    else if (newItem == 'ENTER') {
      if (this.addQty != "") {
        //this.voidCart();
        this.fnReduceCart();
        this.addQty = '';
      }
    }
    else {
      if (parseInt(this.addQty) <= 0) {
        this.addQty = newItem;
      } else {
        this.addQty = this.addQty + newItem;
      }

    }

    if (parseInt(this.addQty) > this.activeCart.qty) {
      this.addQty = this.activeCart.qty.toString();
    }

  }

}
