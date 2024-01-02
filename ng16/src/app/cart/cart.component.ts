import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ItemsComponent } from '../items/items.component';
import { CartDetailComponent } from './cart-detail/cart-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MyFunction } from './functions';
import { ItemTebusMurahComponent } from './item-tebus-murah/item-tebus-murah.component';
import { CartUpdatePriceComponent } from './cart-update-price/cart-update-price.component';

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

  @ViewChild('contentAddQty') contentAddQty: any;

  // save by INDEX, bukan ID
  customFunc: any = [
    1, 2, 4, 3,
    5, 0, 0, 0,
    0, 0, 0, 0,

  ]; // SAVE LOCALSTORAGE

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.key = event.key;
    //  console.log(event);

    // BISA DI DALAM Loop!
    if (event.charCode == 70) {
      this.callFunction(1);
    }
  }
  key: any;
  password: string = "";
  barcode: string = "";
  callCursor: any;
  varkioskUuid: string = "kioskUuid";
  kioskUuid: any;
  supervisorMode: boolean = false;
  items: any = [];
  itemsFree: any = [];
  cart: any = [];
  bill: any = [];
  newItem: any = [];
  alert: boolean = false;
  func: MyFunction[] = [
    { id: 0, value: () => { return false; }, label: '&nbsp;' },
    { id: 1, value: () => { this.openComponent('items'); }, label: 'Search Items' },
    {
      id: 2, value: () => {
        if (this.activeCart['barcode'] !== undefined) {
          this.open(this.contentAddQty, this.activeCart)
        } else {
          this.newItem = {
            barcode: '',
            description: "ITEM BELUM DIPILIH",
          }
          this.alert = true;
          setTimeout(() => (this.alert = false), 2000);
        }
      }, label: 'Add Qty'
    },
    { id: 3, value: () => { 
      if(this.items.length > 0){
        this.goToPayment(); 
      } 
    }, label: 'Payment' },
    {
      id: 4, value: () => {
        if (this.activeCart['barcode'] !== undefined) {
          this.openComponent('cartDetail', this.activeCart)
        } else {
          this.newItem = {
            barcode: '',
            description: "ITEM BELUM DIPILIH",
          }
          this.alert = true;
          setTimeout(() => (this.alert = false), 2000);
        }
      }, label: 'Reduce Qty'
    },
    { id: 5, value: () => { this.cancelTrans(); }, label: 'Cancel Trans' },
    { id: 6, value: () => { this.openComponent('itemTebusMurah'); }, label: 'Tebus Murah' },
    {
      id: 7, value: () => {
        if (this.activeCart.length != 0 && (this.activeCart.price < 2 && this.activeCart.price > 0)) {
          this.openComponent('updatePrice');
        } else {
          alert("Item ini tidak bisa update harga");
        }

      }, label: 'Update Rp 1'
    },

    { id: 12, value: () => { this.supervisorMode = false; }, label: 'Close Admin' },

  ];

  tebus_murah: string = "";
  totalTebusMurah: number = 0;
  ilock: number = 0;
  addQty: string = '1';
  item: any = [];
  activeCart: any = [];
  promo_fixed: any = [];
  freeItem: any = [];
  member : string = "";
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
    this.setFunctionSaved();
    this.setCursor();
    this.supervisorMode = false;
    this.newItem = [];
    this.kioskUuid = this.activatedRoute.snapshot.queryParams['kioskUuid'];
    this.httpCart();
    this._docSub = this.configService.getMessage().subscribe(
      (data: { [x: string]: any; }) => {
        // console.log(data);
      }
    );
  }

  addItem(newItem: string) {
    console.log(newItem);
    if (this.setKey == 'BARCODE') {
      if (newItem == 'BS') {
        this.barcode = this.barcode.slice(0, -1);
      }
      else if (newItem == 'AC') {
        this.barcode = '';
      }
      else if (newItem == 'ENTER') {
        if (this.barcode != "") {
          this.addToCart();
          this.barcode = '';
        }
      }
      else {
        this.barcode = this.barcode + newItem.toString();
      }
    }

    else if (this.setKey == 'QTY') {
    
      if (newItem == 'AC') {
        this.qtyItem = 1;
      }

      

      this.qtyItem = parseInt(newItem);
      if (this.qtyItem  < 1) {
        this.qtyItem = 1;
      }
    }
  }

  setFunctionSaved() {
    let storedData: any = [];
    this.http.get<any>(environment.api + "func/index", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);

        // [1,2,4,3,5,0,0,0,0,0,0,0]

        data['items'].forEach((el: { [x: string]: any; }) => {
          storedData.push(parseInt(el['number']));
        });

        //  console.log(storedData);

        this.customFunc = storedData;

        //const storedDataString = localStorage.getItem("function.pos");
        // const storedDataString = data['saveFunc'];
        // if (storedDataString) {
        //   const storedData = JSON.parse(storedDataString);
        //   this.customFunc = storedData;
        // } else {
        //   const storedDataString = localStorage.setItem("function.pos", JSON.stringify(this.customFunc));
        //   console.log("Data tidak ditemukan di localStorage.");
        // }
      }
    )

  }

  callFunction(id: number) {
    const item = this.func.find((x: { id: number; }) => x.id === id);
    console.log(id, item)
    if (item && item.value && typeof item.value === 'function') {
      item.value(); // Panggil fungsi
    }
  }

  callLabel(id: number) {
    const index = this.func.findIndex((item: { id: number }) => item.id === id);
    return this.func[index].label;
  }

  httpCart() {
    this.qtyItem = 1;
    this.sendReload();
    this.activeCart = [];
    this.http.get<any>(environment.api + "cart/index", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        console.log(data);
        this.member = data['member'];
        this.items = data['items'];
        this.ilock = data['ilock'];
        this.itemsFree = data['itemsFree'];
        this.bill = data['bill'];
        this.promo_fixed = data['promo_fixed'];
        this.tebus_murah = data['tebus_murah'];
        this.totalTebusMurah = data['totalTebusMurah'];
        if (data['error'] == true) {
          this.router.navigate(['not-found']);
          this.modalService.dismissAll();
        }
        this.freeItem = data['freeItem'];
        this.scrollToBottom();
      },
      error => {
        console.log(error);
      }
    )
  }

  scrollToBottom() {
    setTimeout(() => {

      try {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }, 0);
  }

  setCursor() {
    this.callCursor = setInterval(() => {
      this.rows.nativeElement.focus();
      // console.log( new Date().getSeconds())
    }, 300);
  }

  ngOnDestroy() {
    clearInterval(this.callCursor);
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
  }

  addToCart() {
    this.activeCart = [];
    this.alert = false;
    const body = {
      barcode: this.barcode,
      kioskUuid: this.kioskUuid,
      qty: this.qtyItem,
    }

    this.http.post<any>(environment.api + "Cart/addToCart", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.newItem = data['item'];

        if (data['error'] == false) {
          if (data['result'] == 'SUPERVISOR') {
            clearInterval(this.callCursor);
            this.modalService.open(this.contentPassword, { size: 'md' }).result.then(
              (result) => {

              },
              (reason) => {
                this.barcode = "";
                //   this.setCursor();
              },
            );


          }
          else if (data['result'] == 'ITEMS') {
            this.alert = true;
            this.httpCart();
            this.barcode = "";
          }else if (data['result'] == 'MEMBER') {
            this.alert = true;
            this.httpCart();
            this.barcode = "";
            this.newItem = {
              asItem : false,
              barcode: this.barcode,
              description: data['member']['id'] != "" ? "SELAMAT DATANG KEMBALI "+data['member']['name'] :"MEMBER ID TIDAK DITEMUKAN",
            }
          } else {
            this.barcode = "";
            this.alert = true;
            this.newItem = {
              asItem : true,
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
    clearInterval(this.callCursor);
    this.addQty = '1';
    this.item = item;
    this.modalService.open(content, { size: 'lg' }).result.then(
      (result) => {
        clearInterval(this.callCursor);
        console.log('   clearInterval(this.callCursor); ');
      },
      (reason) => {
        console.log('CLOSE');
        this.setCursor();
      },
    )
  }

  checkNumber() {

    // if (this.addQty < 1) {
    //   this.addQty = 1;
    // }

  }


  selectItem(x: any) {
    console.log(x);
    this.activeCart = []
    if (x.total > 0) {
      this.activeCart = x;
    }
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

        this.addQty = '';
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


    clearInterval(this.callCursor);


    if (comp == 'items') {
      const modalRef = this.modalService.open(ItemsComponent, { size: 'lg' });
      modalRef.result.then(
        (result) => {
          //clearInterval(this.callCursor);
          console.log('   clearInterval(this.callCursor); ');
        },
        (reason) => {
          console.log('CLOSE 1001');
          this.setCursor();

        },
      );
      modalRef.componentInstance.kioskUuid = this.kioskUuid;
      modalRef.componentInstance.qty = this.qtyItem;
      
      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('modalRef.componentInstance.newItemEvent', data);
        this.httpCart();
        //  this.setCursor();

      });
    }

    if (comp == 'cartDetail') {
      const modalRef = this.modalService.open(CartDetailComponent, { size: 'md' });
      modalRef.result.then(
        (result) => {
          //clearInterval(this.callCursor);
          console.log('   clearInterval(this.callCursor); ');
        },
        (reason) => {
          console.log('CLOSE');
          //   this.setCursor();
        },
      );
      modalRef.componentInstance.activeCart = this.activeCart;
      modalRef.componentInstance.item = item;
      modalRef.componentInstance.kioskUuid = this.kioskUuid;
      modalRef.componentInstance.totalTebusMurah = this.totalTebusMurah;

      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('modalRef.componentInstance.newItemEvent', data);
        this.httpCart();
        // this.setCursor();

        this.activeCart = [];
      });
    }

    if (comp == 'updatePrice') {
      const modalRef = this.modalService.open(CartUpdatePriceComponent, { size: 'lg' });
      modalRef.result.then(
        (result) => {
          //clearInterval(this.callCursor);
          console.log('   clearInterval(this.callCursor); ');
        },
        (reason) => {
          console.log('CLOSE');
          // this.setCursor();

        },
      );
      modalRef.componentInstance.activeCart = this.activeCart;
      modalRef.componentInstance.kioskUuid = this.kioskUuid;

      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('modalRef.componentInstance.newItemEvent', data);
        this.httpCart();
        // this.setCursor();
      });
    }

    if (comp == 'itemTebusMurah') {
      const modalRef = this.modalService.open(ItemTebusMurahComponent, { size: 'xl' });
      modalRef.componentInstance.kioskUuid = this.kioskUuid;
      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('itemTebusMurah', data);
        this.httpCart();
        // this.setCursor();
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
   // this.sendReload();
    this.router.navigate(['payment'], { queryParams: { kioskUuid: this.kioskUuid } });
    this.modalService.dismissAll();
    // this.http.post<any>(environment.api + "cart/goToPayment", body, {
    //   headers: this.configService.headers(),
    //   params: {
    //     kioskUuid: this.kioskUuid,
    //   }
    // }).subscribe(
    //   data => {
    //     console.log(data);
    //     this.sendReload();
    //     this.router.navigate(['payment'], { queryParams: { kioskUuid: this.kioskUuid } });
    //     this.modalService.dismissAll();
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // )
  }

  close() {
    this.alert = false;

  }

  back() {
    history.back();
  }

  addAmount(val: string) {
    let amount: number = 0;
    let tempAmount = this.activeCart.price.toString();
    this.activeCart.price = Number.parseInt(tempAmount + val);
  }

  paymentCutLastOne() {
    let tempAmount = this.activeCart.price.toString().slice(0, -1);
    let amount = Number.parseInt(tempAmount);

    this.activeCart.price = (Number.isNaN(amount)) ? 0 : amount;
  }
  paymentAdd(val: number) {
    this.activeCart.price = this.activeCart.price + val;
  }

  paymentAC() {
    this.activeCart.price = 0;
  }
  updatePrice() {
    const body = {
      activeCart: this.activeCart,
      kioskUuid: this.kioskUuid
    }
    console.log(body);
    this.http.post<any>(environment.api + "cart/updatePrice", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.sendReload();
        this.httpCart();
        this.modalService.dismissAll();
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
        this.onSubmitQty();
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
  }


  removeItem() {
    console.log(this.activeCart);

    const body = {
      activeCart: this.activeCart,
      kioskUuid: this.kioskUuid
    }
    console.log(body);
    this.http.post<any>(environment.api + "cart/removeItem", body, {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.httpCart();
      },
      error => {
        console.log(error);
      }
    )
  }

  qtyItem: number = 1;
  setKey: string = 'QTY';
  fnKeyboardSet(val: string) {
    this.setKey = val;
    console.log(val);
  }
}
