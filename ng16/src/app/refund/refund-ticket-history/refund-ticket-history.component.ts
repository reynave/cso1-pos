import { Component, OnInit } from '@angular/core';
import { ConfigService } from './../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-refund-ticket-history',
  templateUrl: './refund-ticket-history.component.html',
  styleUrls: ['./refund-ticket-history.component.css']
})
export class RefundTicketHistoryComponent implements OnInit {
  searchTrans: string = "";
  items: any = [];
  refund : any = [];
  id: string = "";
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
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.httpGet();
  }

  httpGet() {
    this.http.get<any>(environment.api + "refund/ticket", {
      headers: this.configService.headers(),
      params: {
        id: this.id,
      }
    }).subscribe(
      data => {
        console.log(data);
        this.items = data['items'];
        this.refund = data['refund'];
        
      },
      error=>{
        console.log(error);
      }
    )
  }

}
