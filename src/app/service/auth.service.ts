import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from '../model/user';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _currentUser$: Observable<User>;

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {
    this._currentUser$ = this.afAuth.authState.pipe(
      switchMap((user: firebase.User) => {
        if(user) {
          return this.db.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          of(null);
        }
      })
    )
  }

  public get currentUser$(): Observable<User> {
    return this._currentUser$;
  }

  public get currentFireUser$(): Observable<firebase.User> {
    return this.afAuth.authState;
  }

  public get currentUserId(): string {
    return this.afAuth.auth.currentUser.uid;
  }

  public get authenticated$(): Observable<boolean> {
    return this.afAuth.authState.pipe(map(usr => !!usr));
  }

  public async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this._updateuserData(credential.user);
  }

  public async signOut() {
    await this.afAuth.auth.signOut();
  }

  private _updateuserData({uid, email, displayName, photoURL}: firebase.User) {
    const userRef: AngularFirestoreDocument<User> = this.db.doc(`users/${uid}`);
    const data = {
      uid,
      email,
      displayName,
      photoURL
    };

    return userRef.set(data, {merge: true});
  }
}
