import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FirebaseError } from '@firebase/util';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { GoogleAuthProvider } from 'firebase/auth'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User | undefined
  user$: Observable<User | undefined>
  constructor(
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private firestore: AngularFirestore,
    private router: Router,
  ) {
    this.auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.user$ = this.firestore.doc<User>(`users/${firebaseUser.uid}`).valueChanges()
      }
      else this.user$ = of(undefined)
      // this.user$.subscribe(user => console.log(user?.uid))
    })
  }

  async signUp(email: string, password: string, name: string) {
    try {
      const credential = await this.auth.createUserWithEmailAndPassword(email, password)
      if (credential.user === null) throw new Error()
      this.setUserData(credential.user)
      this.openSuccessSnackBar('Successfully created new account.')
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  async loginWithEmailAndPassword(email: string, password: string) {
    try {
      const credentials = await this.auth.signInWithEmailAndPassword(email, password)
      if (credentials.user === null) return
      this.openSuccessSnackBar('Successfully logged in.')
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  async googleLogin() {
    try {
      await this.auth.signInWithPopup(new GoogleAuthProvider())
      this.openSuccessSnackBar('Successfully logged in.')
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  logout() {
    this.auth.signOut()
  }

  setUserData({ uid, email, displayName }: firebase.default.User) {
    return this.firestore.doc(`users/${uid}`).set({
      uid,
      email,
      displayName
    },
      { merge: true })
  }
  openSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      verticalPosition: 'top',
      panelClass: ['green-snackbar'],
      duration: 4000,
    });
  }
  openFailSnackBar(message = 'Something went wrong.'): void {
    this.snackBar.open(message, 'Dismiss', {
      verticalPosition: 'top',
      panelClass: ['red-snackbar']
    });
  }
}
