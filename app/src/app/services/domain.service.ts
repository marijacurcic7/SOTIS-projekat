import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from '@firebase/util';
import { map } from 'rxjs/operators';
import { Domain } from '../models/domain.model';
import { DomainProblem } from '../models/domainProblem.model';

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


  /**
   * ---------------------- Domain Problems --------------------------- 
   * ------------------------------------------------------------------
   */

  getDomainProblems(domainId: string) {
    const domainProblemsCollection = this.firestore.collection<DomainProblem>(`domains/${domainId}/domainProblems`);
    return domainProblemsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DomainProblem;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }

  async addDomainProblem(domainProblem: DomainProblem, domain: Domain) {
    try {
      const docRef = await this.firestore.collection<DomainProblem>(`domains/${domain.id}/domainProblems`).add(domainProblem)
      const docData = (await docRef.get()).data()
      if (docData) docData.id = (await docRef.get()).id
      this.openSuccessSnackBar(`${domainProblem.label} succesfully saved.`)
      return docData
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  async editDomainProblem(domainProblem: DomainProblem, domain: Domain) {
    try {
      await this.firestore.doc<DomainProblem>(`domains/${domain.id}/domainProblems/${domainProblem.id}`).update({
        label: domainProblem.label
      })
      this.openSuccessSnackBar(`${domainProblem.label} succesfully updated.`)
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }
  async deleteDomainProblem(domainProblem: DomainProblem, domain: Domain) {
    try {
      await this.firestore.doc(`domains/${domain.id}/domainProblems/${domainProblem.id}`).delete()
      const queryResults = this.firestore.collection<DomainProblem>(`domains/${domain.id}/domainProblems`, ref =>
        ref.where('output', 'array-contains', domainProblem.id))
        .get()

      queryResults.subscribe(querySnapshot => {
        console.log('queries')
        querySnapshot.forEach(async parentNode => {
          const output = parentNode.data().output?.filter(childNodeId => childNodeId !== domainProblem.id)
          await parentNode.ref.update({ output })
        })
      })
      this.openSuccessSnackBar(`${domainProblem.label} succesfully deleted.`)
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  async connectTwoNodes(parent: DomainProblem, child: DomainProblem, domain: Domain) {
    let outputList: string[];
    if (parent.output && child.id) outputList = [...parent.output, child.id]
    else if (child.id) outputList = [child.id]
    else return this.openFailSnackBar('Child is missing ID.')

    let inputList: string[];
    if (child.input && parent.id) inputList = [...child.input, parent.id]
    else if (parent.id) inputList = [parent.id]
    else return this.openFailSnackBar('Parent is missing ID.')

    await this.firestore.doc<DomainProblem>(`domains/${domain.id}/domainProblems/${parent.id}`).update({
      output: outputList
    });
    await this.firestore.doc<DomainProblem>(`domains/${domain.id}/domainProblems/${child.id}`).update({
      input: inputList
    })
  }

  /**
   * ---------------------- Real Domain Problems --------------------------- 
   * ------------------------------------------------------------------
   */
  async addRealDomainProblems(realDomainProblems: DomainProblem[], domain: Domain,) {
    try {
      const docRef = this.firestore.collection<DomainProblem>(`domains/${domain.id}/realDomainProblems`)
      realDomainProblems.forEach(async problem => await docRef.doc(problem.id).set(problem))
      this.openSuccessSnackBar(`Real domain problems succesfully saved.`)
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  getRealDomainProblems(domainId: string) {
    const realDomainProblemsCollection = this.firestore.collection<DomainProblem>(`domains/${domainId}/realDomainProblems`);
    return realDomainProblemsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as DomainProblem;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
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
