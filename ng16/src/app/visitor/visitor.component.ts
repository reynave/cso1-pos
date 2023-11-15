import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintingService } from '../service/printing.service';

@Component({
  selector: 'app-visitor',
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css']
})
export class VisitorComponent implements OnInit, OnDestroy {

  @ViewChild('chatContainer') chatContainer: ElementRef | any;
  private _docSub: any;
  barcode: string = "";
  callServer: any;
  varkioskUuid: string = "kioskUuid";
  kioskUuid: string = "";
  transactionId: string = "";
  supervisorMode: boolean = false;
  items: any = [];
  cart: any = [];
  newItem: any = [];
  alert: boolean = false;
  total: any = {
    bill: 0,
    paid: 0,
    remaining: 0,
  };
  kioskPaid: any = [];
  summary: any = [];
  date: any = new Date();
  paymentMethod: any = [];
  close: boolean = false;
  balance: any = [];
  action: string = "home";
  account: any = []; itemsFree: any = [];
  bill: any = []; timeout: any;
  promo_fixed: any = [];
  tebus_murah: any = [];

  constructor(
    private configService: ConfigService,
    private printing: PrintingService,
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
    this.account = this.configService.account();
    this.timeout = setInterval(() => {
      this.date = new Date();
    }, 1000);

    this._docSub = this.configService.getMessage().subscribe(
      (data: { [x: string]: any; }) => {
        console.log(data);
        this.kioskUuid = data['kioskUuid'];
        this.transactionId = data['transactionId'];
        this.action = data['action'];
        if (data['kioskUuid'] === undefined) {
          this.httpBill();
        } else {
          this.httpItem();
          this.httpPaymentInvoice();
        }
        this.scrollToBottom();

      }
    );
  }

  ilock: number = 0;
  httpItem() {
    console.log(this.kioskUuid);
    console.log(this.transactionId);

    this.http.get<any>(environment.api + "cart/index", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid,
      }
    }).subscribe(
      data => {
        this.ilock = data['ilock'];
        this.items = data['items'];
        this.itemsFree = data['itemsFree'];
        this.bill = data['bill'];
        this.promo_fixed = data['promo_fixed'];
        this.tebus_murah = data['tebus_murah'];
        console.log(data);
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
    }, 1000);
  }

  httpPaymentInvoice() {
    this.http.get<any>(environment.api + "payment/invoice", {
      headers: this.configService.headers(),
      params: {
        kioskUuid: this.kioskUuid
      }
    }).subscribe(
      data => {
        this.total = data['total'];
        this.kioskPaid = data['kioskPaid'];
        this.close = data['close'];
        this.isCloseTransaction();
        console.log(data);
      },
      error => {
        console.log(error);
      }
    )
  }
  copy: number = 0;
  outputPrint: string = "";
  transactionDate: string = "";
  httpBill() {
    this.http.get<any>(environment.api + "printing/detail", {
      headers: this.configService.headers(),
      params: {
        id: this.transactionId,
      }
    }).subscribe(
      data => {
        console.log('httpBill', data);
        this.balance = data['balance'];
        this.summary = data['summary'];
        this.transactionDate = data['date'];
        data['items'].forEach((el: any) => {
          let temp = {
            barcode: el['barcode'],
            description: el['description'],
            originPrice: el['price'],
            qty: el['qty'],
            totalDiscount: el['totalDiscount'],
            totalPrice: el['totalPrice'],
            promotionDescription: el['promotionDescription'],
            promotionId: el['promotionId'],
            note: el['note'],
            isSpecialPrice: el['isSpecialPrice'],
            total: el['totalPrice'],
          }
          this.items.push(temp);
        }); 
        this.paymentMethod = data['paymentMethod'];
        this.summary = data['summary'];


        this.copy = data['copy'];
        console.log('httpBill',data);
        this.items = data['items'];
        this.outputPrint = this.printing.template(data);  
      },
      error => {
        console.log(error);
      }
    )
  }
 
  isCloseTransaction() {

  }

  ngOnDestroy(): void {
    this._docSub.unsubscribe();
    this.timeout = null;
  }



   
}
