import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from '@firebase/util';
import { map } from 'rxjs/operators';
import { Domain } from '../models/domain.model';

@Injectable({
  providedIn: 'root'
})
export class DomainService {

  constructor(
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
  ) { }

  async addDomain(domainName: string) {
    try {
      await this.firestore.collection('domains').add({ name: domainName })
      this.openSuccessSnackBar(`${domainName} succesfully saved.`)
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  async editDomain(domain: Domain) {
    try {
      await this.firestore.doc(`domains/${domain.id}`).update({ name: domain.name })
      this.openSuccessSnackBar(`${domain.name} succesfully updated.`)
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  async deleteDomain(domain: Domain) {
    try {
      await this.firestore.doc(`domains/${domain.id}`).delete()
      this.openSuccessSnackBar(`${domain.name} succesfully deleted.`)
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  getDomains() {
    const domainsCollection = this.firestore.collection<Domain>('domains');
    return domainsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Domain;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }
  getDomain(domainId: string) {
    return this.firestore.doc<Domain>(`domains/${domainId}`).valueChanges();
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
