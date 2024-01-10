import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edc-detail',
  templateUrl: './edc-detail.component.html',
  styleUrls: ['./edc-detail.component.css']
})
export class EdcDetailComponent implements OnInit, OnDestroy {
  @Input() item: any; 

  @Output() newItemEvent = new EventEmitter<string>();
	note : string = "";
  com : string = "";
  selectComNumber : any = Array.from({ length: 20 }, (_, index) => "COM"+(index + 1));
  private _docSub: any;
  constructor(
    private modalService: NgbModal,
    private configService: ConfigService,
    private http: HttpClient,
  ) {}
 
  ngOnInit(): void {
    this._docSub = this.configService.getMessage().subscribe(
      (data: { [x: string]: any; }) => {
         console.log(data);
         this.note = data['name'] +" "+ data['message'] ;
      }
    );
  }
  ngOnDestroy(): void {
    console.log('modal ngOnDestroy');
    this._docSub.unsubscribe(); 
  }

  close(){
    this.modalService.dismissAll();
  }
  status(){
    if(this.item.status == '1'){
      this.item.status = '0';
    }
    else if(this.item.status == '0'){
      this.item.status = '1';
    }
  }

  echoTest(){
    const msg = {
      to: 'ERC',
      msg: null,
      action: 'echoTest', 
    }
    this.configService.sendMessage(msg);
  }

   

  save(){
    this.note = 'Loading...';
    const body = {
      item :this.item
    }
    this.http.post<any>(environment.api+"edc/save",body,{
      headers:this.configService.headers(),
    }).subscribe(
      data=>{
        this.note = "Update Success";
        console.log(data);
      },
      error=>{
        console.log(error);
      }
    )
  }
}
