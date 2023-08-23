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

  @Output() newItemEvent = new EventEmitter<string>();
  search: string = "";
  items: any = [];
  isSearch: boolean = false;
  detail: any = [];
  loading: boolean = false;
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
        console.log(data);
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
      },
      error => {
        console.log(error);
      }
    )
  }
  close() {
    this.modalService.dismissAll();
  }

  updatePrice(){
    const body = {
      detail: this.detail,
      kioskUuid : this.kioskUuid, 
    }
    console.log(body);
    this.http.post<any>(environment.api + "cart/updatePrice", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.httpGet();

        this.addNewItem('update Price items');
      },
      error => {
        console.log(error);
      }
    )
  }

  fnVoidAllCartItems(){
    const body = {
      detail: this.detail,
      kioskUuid : this.kioskUuid, 
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
}
