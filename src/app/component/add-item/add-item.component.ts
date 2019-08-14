import { Component, OnInit } from '@angular/core';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.sass']
})
export class AddItemComponent implements OnInit {

  public hideForm = true;
  public showSuccess = false;
  public model: {name: string, price: number} = {name: undefined, price: null};

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

  formSubmit() {
    this.dataService.addItem(this.model.name, this.model.price).then(() => {
      this.clearForm();
    });
  }

  clearForm() {
    this.model.name = undefined;
    this.model.price = undefined;
    this.hideForm = true;
    this.showSuccess = true;
  }

  closeAlert() {
    this.showSuccess = false;
  }

}
