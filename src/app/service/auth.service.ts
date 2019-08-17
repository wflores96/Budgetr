import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from '../model/user';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _currentFireUser$: Observable<firebase.User>;

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {
    this._currentFireUser$ = afAuth.authState.pipe(shareReplay(1)); // share the most recent value with new subscribers
  }

  public get currentFireUser$(): Observable<firebase.User> {
    return this._currentFireUser$;
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
