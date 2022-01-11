import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ImsqtiService {

  constructor(
    private fns: AngularFireFunctions,
    private snackBar: MatSnackBar,
  ) { }

  async downloadQti(testId: string) {
    console.log('download started')
    // try to download from url, if url doesn't exists try to create qti zip
    // try {
      
    // } catch (error) {
      
    // }

    try {
      const callable = this.fns.httpsCallable<string>('createQti')
      return await callable(testId).toPromise()
    } catch (error) {
      if (error instanceof FirebaseError) {
        // if (error.code === 'functions/already-exists') return
         this.openFailSnackBar(error.code);
      }
      else this.openFailSnackBar();
      throw error;
    }
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
