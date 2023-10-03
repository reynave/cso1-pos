import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from './../../service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-item-tebus-murah',
  templateUrl: './item-tebus-murah.component.html',
  styleUrls: ['./item-tebus-murah.component.css']
})
export class ItemTebusMurahComponent implements OnInit {  
  @Input() kioskUuid: any; 
  @Output() newItemEvent = new EventEmitter<string>();

  search: string = "";
  items: any = [];  
  loading: boolean = false;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public configService: ConfigService,
    public http: HttpClient
  ) { }
  ngOnInit() {
    this.httpGet();
  }

  httpGet() {
    this.http.get<any>(environment.api+"items/tebusMurah",{
      headers : this.configService.headers(),
      params : {
        kioskUuid : this.kioskUuid 
      }
    }).subscribe(
      data=>{
        console.log(data);
        this.items =  data['items'];
      }
    )
  }

  onTb(x:any){
    const body = {
      item : x,
      kioskUuid : this.kioskUuid,
    }
    this.http.post<any>(environment.api+"cart/addTebusMurah",body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data); 
        this.addNewItem("reload");
        this.httpGet();
      }
    )
  }

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  close(){
    this.modalService.dismissAll();
  }
}
