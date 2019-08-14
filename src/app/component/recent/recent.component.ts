import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';
import { Aggregate } from 'src/app/model/aggregate';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.sass']
})
export class RecentComponent implements OnInit {

  public data$: Observable<Aggregate>;
  public uidToDelete: string = '';

  constructor(private dataService: DataService, private modalService: NgbModal) { }

  ngOnInit() {
    this.data$ = this.dataService.currentUserAggregateData$;
  }

  public deleteBudgetItem(uid: string, content) {
    console.log(`request for delete of ${uid}`);
    this.uidToDelete = uid;
    this.modalService.open(content)
  }

  public confirmDelete() {
    console.log(`confirmed deleting ${this.uidToDelete}`);
    this.modalService.dismissAll();
  }

}
