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
  constructor(
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private firestore: AngularFirestore,
    private router: Router,
  ) {
    this.auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const ret = this.firestore.doc<User>(`users/${firebaseUser.uid}`).valueChanges()

        ret.subscribe(user => { if (user) {
          this.user = user;
          this.user.uid = firebaseUser.uid;

         } })
      }
      else this.user = undefined
      // this.user$.subscribe(user => console.log(user?.uid))
    })
  }

  async signUp(email: string, password: string, name: string) {
    try {
      // check domain
      const domain = email.split('@')[1]
      if (domain !== 'teacher.com' && domain !== 'student.com') throw new Error('bad domain.')

      // sign up
      const credential = await this.auth.createUserWithEmailAndPassword(email, password)
      if (credential.user === null) throw new Error()
      this.setUserData(credential.user.uid, email, name)
      this.openSuccessSnackBar('Successfully created new account.')
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar(error as string)
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
      const credential = await this.auth.signInWithPopup(new GoogleAuthProvider())
      if (credential.user === null) throw new Error()
      const { uid, email, displayName } = credential.user
      if (uid === null || email === null || displayName === null) throw new Error()
      this.setUserData(uid, email, displayName)
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

  setUserData(uid: string, email: string, displayName: string) {
    let role: 'teacher' | 'student' | 'admin' | undefined;

    const domain = email.split('@')[1]
    if (domain === 'teacher.com') role = 'teacher'
    else if (domain === 'student.com') role = 'student'
    else role = undefined

    return this.firestore.doc(`users/${uid}`).set({
      uid,
      email,
      displayName,
      role,
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
