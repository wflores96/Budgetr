import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';
import { Aggregate } from 'src/app/model/aggregate';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BudgetItem } from 'functions/src';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.sass']
})
export class RecentComponent implements OnInit {

  public aggregate$: Observable<Aggregate>;
  public recentTransactions$: Observable<BudgetItem[]>;
  private uidToDelete = '';

  constructor(private dataService: DataService, private modalService: NgbModal) { }

  ngOnInit() {
    // this.data$ = this.dataService.currentUserAggregateData$;
    this.aggregate$ = this.dataService.currentUserAggregateData$;
    this.recentTransactions$ = this.dataService.recentTransactions$;
  }

  public deleteBudgetItem(uid: string, content) {
    this.uidToDelete = uid;
    this.modalService.open(content);
  }

  public confirmDelete() {
    console.log('deleting', this.uidToDelete);
    this.modalService.dismissAll();
    this.dataService.deleteItem(this.uidToDelete);
  }

}
