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
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private printing: PrintingService,
    private router : Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.queryParams['id']; 
    this.httpBill();
    this.sendReload();
  }
  sendReload(){
    const msg = {
      to: 'visitor',
      msg: 'payment method',
      action : 'reload',
      transactionId : this.id
    }
    this.configService.sendMessage(msg);
    console.log("sendReload");
  }


  httpBill() {
    this.http.get<any>(environment.api + "printing/detail", {
      headers: this.configService.headers(),
      params: {
        id: this.id,
      }
    }).subscribe(
      data => {
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

  fnPrinting() {
    this.http.get<any>(environment.api + "printing/copyPrinting", {
      headers: this.configService.headers(),
      params: {
        id: this.id,
      }
    }).subscribe(
      data => {
        this.copy = data['copy'];
        this.printing.dotMetix()
        this.httpBill();
      },
      error => {
        console.log(error);
      }
    )
  }

  open(content: any, x: any) {

    this.modalService.open(content, { size: 'lg' });
  }


  home(){
    this.router.navigate(['home']);
  }


}
