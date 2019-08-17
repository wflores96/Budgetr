import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BudgetItem } from '../model/budget-item';
import { Observable, of } from 'rxjs';
import { Aggregate } from '../model/aggregate';
import { firestore } from 'firebase';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AuthService } from './auth.service';
import { switchMap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _aggregate$: Observable<Aggregate>;
  private _recentTransactions$: Observable<BudgetItem[]>;

  constructor(private db: AngularFirestore, private auth: AuthService, private functions: AngularFireFunctions) {
    this._aggregate$ = this.auth.currentFireUser$.pipe(
      switchMap(user => db.doc<Aggregate>(`aggregate/${user.uid}`).valueChanges()),
      shareReplay(1) // share
    );


    this._recentTransactions$ = this.auth.currentFireUser$.pipe(
      switchMap(user => db.collection<BudgetItem>('budget-items',
      snapshot => snapshot.where('forUser', '==', user.uid).orderBy('date', 'desc').limit(5)
      ).valueChanges()),
      shareReplay(1)
    );
  }

  public get recentTransactions$(): Observable<BudgetItem[]> {
    return this._recentTransactions$;
  }

  public get currentUserAggregateData$(): Observable<Aggregate> {
    return this._aggregate$;
  }

  public addItem(name: string, price: number): Promise<void> {
    const userId = this.auth.currentUserId;
    const id: string = this.db.createId();
    return this.db.doc<BudgetItem>(`budget-items/${id}`).set({uid: id, name, price, date: firestore.Timestamp.now(), forUser: userId});
  }

  public checkMigrate() {
    // const callable = this.functions.httpsCallable(CALLABLE_FUNCTIONS.MIGRATE_MONTHLY);
    // return callable({});

    return of({data: 'dank'});
  }

  public deleteItem(id: string): Promise<void> {
    console.log('deleting for ', this.auth.currentUserId);
    return this.db.doc<BudgetItem>(`budget-items/${id}`).delete();
  }
}
