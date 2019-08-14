import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BudgetItem } from '../model/budget-item';
import { Observable, of } from 'rxjs';
import { Aggregate } from '../model/aggregate';
import { firestore } from 'firebase';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { CALLABLE_FUNCTIONS } from 'src/app/app-constant';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _currentUserItems$: Observable<BudgetItem[]>;
  private _aggregate$: Observable<Aggregate>;

  constructor(private db: AngularFirestore, private auth: AuthService, private functions: AngularFireFunctions) {
    this._currentUserItems$ = this.auth.currentFireUser$.pipe(
      switchMap(user => {
        return db.collection<BudgetItem>(`budget-items`, ref => ref.where('forUser', '==', user.uid)).valueChanges();
      })
    );
    this._aggregate$ = this.auth.currentFireUser$.pipe(
      switchMap(user => db.doc<Aggregate>(`aggregate/${user.uid}`).valueChanges())
    );
  }

  public get currentUserItems$(): Observable<BudgetItem[]> {
    return this._currentUserItems$;
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
    return of({data:'dank'})
  }
}
