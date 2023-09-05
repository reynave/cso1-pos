import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ItemsComponent } from '../items/items.component';
import { CartDetailComponent } from './cart-detail/cart-detail.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  @ViewChild('formRow') rows: ElementRef | any;
  @ViewChild('formPassword') formPassword: ElementRef | any;

  @ViewChild('contentPassword') contentPassword: any;
  @ViewChild('chatContainer') chatContainer: ElementRef | any;

  password: string = "";
  barcode: string = "";
  callServer: any;
  varkioskUuid: string = "kioskUuid";
  kioskUuid: any;
  supervisorMode: boolean = false;
  items: any = [];
  itemsFree: any = [];
  cart: any = [];
  bill: any = [];
  newItem: any = [];
  alert: boolean = false;
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
  ilock: number = 0;
  addQty: number = 1;
  item: any = [];
  activeCart: any = [];

  private _docSub: any;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.supervisorMode = false;
    this.newItem = [];
    this.kioskUuid = this.activatedRoute.snapshot.queryParams['kioskUuid'];
    this.httpCart();
    this._docSub = this.configService.getMessage().subscribe(
      (data: { [x: string]: any; }) => {
        console.log(data);
      }
    );
  }


  httpCart() {
    this.sendReload();
    this.http.get<any>(environment.api + "cart/index", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        console.log(data);
        this.items = data['items'];
        this.ilock = data['ilock'];
        this.itemsFree = data['itemsFree'];
        this.bill = data['bill'];
        if (data['error'] == true) {
          this.router.navigate(['not-found']);
          this.modalService.dismissAll();
        }
        console.log(data);
        this.scrollToBottom();
      },
      error => {
        console.log(error);
      }
    )
  }

  scrollToBottom() {
    setTimeout(() => {
      console.log('scrollToBottom')
      try {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }, 0);
  }

  callHttpServer() {
    this.callServer = setInterval(() => {
      this.rows.nativeElement.focus();
    }, 300);
  }

  ngOnDestroy() {
    clearInterval(this.callServer);
    this._docSub.unsubscribe();
  }
  sendReload() {
    const msg = {
      to: 'visitor',
      msg: 'add Item',
      action: 'cart',
      kioskUuid: this.kioskUuid
    }
    this.configService.sendMessage(msg);
    console.log("sendReload");
  }

  addToCart() {
    this.activeCart = [];
    this.alert = false;
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

        if (data['error'] == false) {
          if (data['result'] == 'SUPERVISOR') {

            this.modalService.open(this.contentPassword, { size: 'md' }).result.then(
              (result) => {

              },
              (reason) => {
                this.barcode = "";
              },
            );


          }
          else if (data['result'] == 'ITEMS') {
            this.alert = true;
            this.httpCart();
            this.barcode = "";
          } else {
            this.barcode = "";
            this.alert = true;
            this.newItem = {
              barcode: this.barcode,
              description: "ITEM TIDAK DI TEMUKAN!",
            }
          }
        }


        setTimeout(() => (this.alert = false), 4000);
      },
      error => {
        this.newItem = {
          barcode: this.barcode,
          description: "ITEM TIDAK DI TEMUKAN!",
        }
        this.barcode = "";
        console.log(error);
      }
    )

  }

  open(content: any, item: any) {
    this.addQty = 1;
    this.item = item;
    this.modalService.open(content);
  }

  checkNumber() {

    if (this.addQty < 1) {
      this.addQty = 1;
    }

  }


  selectItem(x: any) {
    console.log(x);
    this.activeCart = x;
  }

  onSubmitQty() {
    const body = {
      kioskUuid: this.kioskUuid,
      item: this.item,
      activeCart: this.activeCart,
      addQty: this.addQty
    }

    this.http.post<any>(environment.api + "Cart/onSubmitQty", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {

        this.addQty = 0;
        console.log(data);
        this.modalService.dismissAll();

        this.httpCart();
      },
      error => {
        console.log(error);
      }
    )
  }

  openComponent(comp: any, item: any = []) {
    console.log(item);
    if (comp == 'items') {
      const modalRef = this.modalService.open(ItemsComponent, { size: 'lg' });
      modalRef.componentInstance.kioskUuid = this.kioskUuid;
      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('modalRef.componentInstance.newItemEvent', data);
        this.httpCart();
      });
    }
    if (comp == 'cartDetail') {
      const modalRef = this.modalService.open(CartDetailComponent, { size: 'lg' });
      modalRef.componentInstance.item = item;
      modalRef.componentInstance.kioskUuid = this.kioskUuid;
      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('modalRef.componentInstance.newItemEvent', data);
        this.httpCart();
      });
    }


  }


  fnAdminSubmit() {
    this.supervisorMode = false;
    this.alert = false;
    const body = {
      barcode: this.barcode,
      kioskUuid: this.kioskUuid,
      password: this.password
    }
    this.http.post<any>(environment.api + "Cart/fnAdminSubmit", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        if (data['id'] == this.barcode) {
          this.supervisorMode = true;
          this.barcode = "";
          this.modalService.dismissAll();
        } else {
          alert("WRONG PASSWORD!");

        }
        this.password = "";

      },
      error => {
        console.log(error);
      }
    )
  }


  cancelTrans() {
    const body = {
      kioskUuid: this.kioskUuid,
    }
    if (confirm("Cancel this transaction ?")) {

      this.http.post<any>(environment.api + "Cart/cancelTrans", body, {
        headers: this.configService.headers(),
      }).subscribe(
        data => {
          localStorage.removeItem("kioskUuid");
          this.sendReload();
          history.back();
        },
        error => {
          console.log(error);
        }
      )
    }
  }


  goToPayment() {
    const body = {
      kioskUuid: this.kioskUuid,
    }
    this.http.post<any>(environment.api + "cart/goToPayment", body, {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        console.log(data);
        this.sendReload();
        this.router.navigate(['payment'], { queryParams: { kioskUuid: this.kioskUuid } });
        this.modalService.dismissAll();
      },
      error => {
        console.log(error);
      }
    )
  }

  close() {
    this.alert = false;

  }

}
