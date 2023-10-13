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
    { id: 3, value: () => { this.goToPayment(); }, label: 'Payment' },
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
      }, label: 'Edit Qty'
    },
    { id: 5, value: () => { this.cancelTrans(); }, label: 'Cancel Trans' },
    { id: 6, value: () => { this.openComponent('itemTebusMurah'); }, label: 'Tebus Murah' },
    
    { id: 12, value: () => { this.supervisorMode = false; }, label: 'Close Admin' },

  ];
  totalTebusMurah : number = 0;
  ilock: number = 0;
  addQty: number = 1;
  item: any = [];
  activeCart: any = []; 
  promo_fixed : any = [];
  freeItem : any = [];
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

  setFunctionSaved() { 
    this.http.get<any>(environment.api+"setting/getFunc",{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{ 
        //const storedDataString = localStorage.getItem("function.pos");
        const storedDataString = data['saveFunc']; 
        if (storedDataString) {
          const storedData = JSON.parse(storedDataString);
           this.customFunc = storedData; 
        } else {
          const storedDataString = localStorage.setItem("function.pos", JSON.stringify(this.customFunc)); 
          console.log("Data tidak ditemukan di localStorage.");
        }
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
  tebus_murah : string = "";
  
  httpCart() {
    this.sendReload();
    this.http.get<any>(environment.api + "cart/index", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
      //   console.log(data);
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
    this.activeCart  = []
    if(x.total > 0){
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
      modalRef.componentInstance.totalTebusMurah = this.totalTebusMurah;
      
      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('modalRef.componentInstance.newItemEvent', data);
        this.httpCart();
      });
    }

    if (comp == 'itemTebusMurah') {
      const modalRef = this.modalService.open(ItemTebusMurahComponent, { size: 'xl' }); 
      modalRef.componentInstance.kioskUuid = this.kioskUuid;
      modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
        console.log('itemTebusMurah', data);
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

  back(){
    history.back();
  }
}
