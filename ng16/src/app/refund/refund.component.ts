import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsComponent } from '../items/items.component';

@Component({
  selector: 'app-refund',
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.css']
})
export class RefundComponent implements OnInit {
  searchTrans: string = "";
  items: any = [];
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private rounter: Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.searchTrans = this.activatedRoute.snapshot.queryParams['id'];
    if (this.searchTrans != '') {
      this.fnSearch();
    }
  }

  fnSearch() {
    const body = {
      searchTrans: this.searchTrans
    }
    this.http.get<any>(environment.api + "refund/fnSearch", {
      headers: this.configService.headers(),
      params: body,
    }).subscribe(
      data => {
        this.items = data['items'];
        console.log(data);
      }
    )
  }

  item: any = [];
  detail: any = [];

  fnDetail(item: any) {
    this.item = item;
    this.rounter.navigate(['refund'], { queryParams: { id: item.id } }).then(
      () => {
        const body = {
          id: item.id
        }
        this.http.get<any>(environment.api + "refund/transaction_detail", {
          headers: this.configService.headers(),
          params: body,
        }).subscribe(
          data => {
            this.detail = data['detail'];
            console.log(data);
          }
        )
      }
    )
    //this.modalService.open(content, { size: 'lg' });
  }


  fnCheckItem(index: any) {
    if (this.detail[index]['refund']+this.detail[index]['exchange']  == '') {

      if (this.detail[index]['checkbox'] != true) {
        this.detail[index]['checkbox'] = true;
      } else {
        this.detail[index]['checkbox'] = '';
      }
      this.total();
    }


  }


  total() {
    let total = 0;
    for (let i = 0; i < this.detail.length; i++) {
      if (this.detail[i]['checkbox'] == true) {
        total = total + Number(this.detail[i]['price']);
      }

    }
    return total;
  }

  fnRefund() {
    if (confirm("Are you sure want to refund ?")) {
      const body = {
        detail: this.detail,
        terminalId: localStorage.getItem("terminalId"),
        transactionId: this.item.id,
        total: this.total(),

      }
      this.http.post<any>(environment.api + "refund/fnRefund", body, {
        headers: this.configService.headers()
      }).subscribe(
        data => {
          console.log(data);
          this.rounter.navigate(['refund/ticketHistory'], { queryParams: { id: data['ticket'] } });
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  fnExchange(content: any) {
    this.modalService.open(content, { size: 'xl' });

    const modalRef = this.modalService.open(ItemsComponent, { size: 'lg' });
    modalRef.componentInstance.kioskUuid = 'exchange';
    modalRef.componentInstance.exchange = this.detail;
    
    modalRef.componentInstance.newItemEvent.subscribe((data: any) => {
      let kioskUuid = data['kioskUuid'];
      console.log('newItemEvent', data);
      const body = {
        transactionId: this.item.id,
        detail: this.detail,
        terminalId: localStorage.getItem("terminalId"), 
        ticket: data['ticket'],  
        kioskUuid :kioskUuid,
      }
      this.http.post<any>(environment.api + "refund/fnExchange", body, {
        headers: this.configService.headers()
      }).subscribe(
        data => {
          console.log(data);
          this.rounter.navigate(["cart"], { queryParams: { kioskUuid: kioskUuid } }); 
        },
        error => {
          console.log(error);
        }
      )
   
    });

    // const body = {
    //   terminalId: localStorage.getItem("terminalId"),
    //   exchange: this.detail,
    // }
    // this.http.post<any>(environment.api + "KioskUuid/getKioskUuid", body, {
    //   headers: this.configService.headers(),
    // }).subscribe(
    //   data => {
    //     console.log(data);
    //     this.rounter.navigate(["cart"], { queryParams: { kioskUuid: data['id'] } }); 
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
  }
}
