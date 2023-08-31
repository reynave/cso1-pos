import { Component } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.css']
})
export class ThemesComponent { 
  show = true;
  close() {
		this.show = false;
		setTimeout(() => (this.show = true), 3000);
	}
}
