import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintingService } from '../service/printing.service';

@Component({
  selector: 'app-printing',
  templateUrl: './printing.component.html',
  styleUrls: ['./printing.component.css']
})
export class PrintingComponent implements OnInit {
  id: string = "";
  note: string = "";
  items: any = [];
  outputPrint: string = "";
  copy: number = 0;
  cashDrawer: number = 0;
  isCash: number = 0;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private printing: PrintingService,
    private router: Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.httpBill();
  }
  sendReload() {
    const msg = {
      to: 'visitor',
      msg: 'payment method',
      action: 'cart',
      transactionId: this.id
    }
    this.configService.sendMessage(msg);
    console.log("sendReload");
  }

  outputValidationNota : string = "";
  httpBill() {
    this.http.get<any>(environment.api + "printing/detail", {
      headers: this.configService.headers(),
      params: {
        id: this.id,
      }
    }).subscribe(
      data => {
        this.copy = data['copy'];
        this.isCash = data['isCash'];
        this.items = data['items'];
        this.cashDrawer = data['detail']['cashDrawer'];
        this.outputPrint = this.printing.template(data);
        this.outputValidationNota = this.printing.templateValidationNota(data);
        
        console.log('httpBill', data, this.cashDrawer);
 
        if (data['detail']['printing'] == 0) {
          this.fnPrinting();
        }
 
        if (data['detail']['cashDrawer'] == 0) {
          this.fnOpenCashDrawer();
        }

        this.sendReload();
      },
      error => {
        console.log(error);
      }
    )
  }

  fnOpenCashDrawer() {
    const body = {
      id: this.id,
      copy: this.copy,
      outputPrint: this.outputPrint,
      isCash: this.isCash,
      cashDrawer: this.cashDrawer,
    }
    this.http.post<any>(environment.api + "printing/fnOpenCashDrawer", body, {
      headers: this.configService.headers()
    }).subscribe(
      data => {
        console.log("fnOpenCashDrawer", data);
      },
      error => {
        console.log(error);
        alert("Cash Drawer connection failed.")
      }
    )
  }

  copyPrinting() {
    this.http.get<any>(environment.api + "printing/copyPrinting", {
      headers: this.configService.headers(),
      params: {
        id: this.id,
      }
    }).subscribe(
      data => {
        this.copy = data['copy'];
           this.httpBill();
        if( this.copy > 0){
          this.fnPrinting();
        } 
      },
      error => {
        console.log(error);
      }
    )
  }

  fnPrinting(){
    const body = {
      id: this.id,
      copy: this.copy,
      outputPrint: this.outputPrint,
      isCash: this.isCash,
      cashDrawer: this.cashDrawer,
    }
    this.http.post<any>(environment.api + "printing/fnPrinting", body, {
      headers: this.configService.headers()
    }).subscribe(
      data => {
        console.log("fnPrinting", data);
      },
      error => {
        console.log(error);
        alert("Printer connection failed.")
      }
    )
  }


  fnPrintingNota(){
    const body = { 
      outputPrint: this.outputValidationNota, 
    }
    this.http.post<any>(environment.api + "printing/fnPrintingNota", body, {
      headers: this.configService.headers()
    }).subscribe(
      data => {
        console.log("fnPrinting", data);
      },
      error => {
        console.log(error);
        alert("Printer validation nota connection failed.")
      }
    )
  }



  open(content: any, x: any) {

    this.modalService.open(content, { size: 'lg' });
  }


  home() {
    this.router.navigate(['home']);
  }


}
