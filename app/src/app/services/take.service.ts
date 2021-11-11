import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from '@firebase/app';
import { Take } from '../models/take.model';

@Injectable({
  providedIn: 'root'
})
export class TakeService {

  constructor(
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
  ) { }

  async addTake(take: Take, uid: string) {
    try {
      await this.firestore.collection<Take>(`users/${uid}/takes`).add(take);
    }
    catch(error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code);
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
