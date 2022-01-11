import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from 'firebase/app';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImsqtiService {

  constructor(
    private fns: AngularFireFunctions,
    private storage: AngularFireStorage,
    private snackBar: MatSnackBar,
  ) { }

  async downloadQti(testId: string) {
    // try to download from url, if url doesn't exists try to create qti zip
    try {
      await this.downloadZip(testId)
    }
    catch (error) {
      // if url doesn't exists try to create qti zip
      if (error instanceof FirebaseError && error.code == 'storage/object-not-found') {
        try {
          const callable = this.fns.httpsCallable<string>('createQti')
          await callable(testId).toPromise()
          this.downloadZip(testId)
        }
        catch (error) {
          if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
          else this.openFailSnackBar()
          throw error
        }
      }
      else throw error
    }
  }

  private async downloadZip(testId: string) {
    const fileName = `qti-${testId}.zip`
    const ref = this.storage.ref(fileName)
    const qtiRef = await ref.getDownloadURL().pipe(take(1)).toPromise() as string

    const anchor = document.createElement('a') as HTMLAnchorElement
    anchor.download = fileName
    anchor.href = qtiRef
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
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
