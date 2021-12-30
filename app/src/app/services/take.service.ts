import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot, QueryDocumentSnapshot, QueryFn } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from '@firebase/app';
import { MyAnswer } from '../models/myAnswer.model';
import { Question } from '../models/question.model';
import { Take } from '../models/take.model';
import { map, take } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class TakeService {

  private lastTake: QueryDocumentSnapshot<Take>
  private firstTake: QueryDocumentSnapshot<Take>
  private pageSize: number = 2
  previousTakesPageExists: boolean = false
  nextTakesPageExists: boolean = false

  constructor(
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private fns: AngularFireFunctions,
  ) { }

  getAllTakes(userId: string) {
    const takesCollection = this.firestore.collection<Take>(`users/${userId}/takes`, ref => ref.orderBy('startTime', 'desc'));
    return takesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Take;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }

  async getTakesPage(userId: string, action: 'init' | 'next' | 'previous'): Promise<Take[]> {
    let query: QueryFn;
    if (action === 'next') query = ref => ref.orderBy('startTime', 'desc').startAfter(this.lastTake).limit(this.pageSize)
    else if (action === 'previous') query = ref => ref.orderBy('startTime', 'desc').endBefore(this.firstTake).limitToLast(this.pageSize)
    else query = ref => ref.orderBy('startTime', 'desc').limit(this.pageSize)

    const takesCollection = this.firestore.collection<Take>(`users/${userId}/takes`, query);

    const takes = await takesCollection.snapshotChanges().pipe(take(1)).toPromise()
    // check if data exists
    if (takes.length === 0) return []

    this.firstTake = takes[0].payload.doc
    this.lastTake = takes[takes.length - 1].payload.doc

    return takes.map(a => {
      const data = a.payload.doc.data() as Take;
      const id = a.payload.doc.id;
      data.id = id;
      return data
    })
  }


  previousPage(pageSize: number, userId: string) {
    const takesCollection = this.firestore.collection<Take>(`users/${userId}/takes`,
      ref => ref.orderBy('startTime', 'desc')
        .endBefore(this.firstTake)
        .limitToLast(pageSize)
    )

    return takesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Take;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }







  async addTake(take: Take, uid: string, questions: Question[], answers: MyAnswer[]) {
    try {
      const docRef = await this.firestore.collection<Take>(`users/${uid}/takes`).add(take);
      // write Q & A to firestore
      for (let index = 0; index < questions.length; index++) {
        // write question to firestore
        await this.firestore
          .collection(`users/${uid}/takes/${docRef.id}/questions`)
          .doc(`${questions[index].id}`)
          .set(questions[index])

        // write corresponding empty answer to firestore
        await this.firestore
          .collection(`users/${uid}/takes/${docRef.id}/myAnswers`)
          .doc(`${index}`)
          .set(answers[index])
      }


      // }
      return docRef.id;
    }
    catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code);
      else this.openFailSnackBar();
      throw error;
    }
  }

  getTake(takeId: string, userId: string) {
    const take = this.firestore.doc<Take>(`users/${userId}/takes/${takeId}`);

    return take.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Take;
        const id = a.payload.id;
        data.id = id;
        return data;
      })
    )
  }

  getQuestions(takeId: string, userId: string) {
    const questionsCollection = this.firestore.collection<Question>(`users/${userId}/takes/${takeId}/questions`);
    return questionsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Question;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }

  getQuestion(takeId: string, userId: string, questionId: string) {
    const question = this.firestore.doc<Question>(`users/${userId}/takes/${takeId}/questions/${questionId}`);
    return question.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Question;
        const id = a.payload.id;
        data.id = id;
        return data;
      })
    )
  }

  getMyAnswers(takeId: string, userId: string) {
    const questionsCollection = this.firestore.collection<MyAnswer>(`users/${userId}/takes/${takeId}/myAnswers`);
    return questionsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as MyAnswer;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }

  getMyAnswer(takeId: string, userId: string, questionId: string) {
    return this.firestore.doc<MyAnswer>(`users/${userId}/takes/${takeId}/myAnswers/${questionId}`).valueChanges();
  }

  updateMyAnswer(takeId: string, userId: string, questionId: string, myAnswer: MyAnswer) {
    return this.firestore.doc<MyAnswer>(`users/${userId}/takes/${takeId}/myAnswers/${questionId}`).set(myAnswer);

  }

  updateTake(takeId: string, userId: string, take: Take) {
    return this.firestore.doc<Take>(`users/${userId}/takes/${takeId}`).set(take);

  }

  async finishTake(takeId: string) {
    try {
      const callable = this.fns.httpsCallable<string>('finishTake');
      return callable(takeId).toPromise()
    }

    catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code);
      else this.openFailSnackBar();
      throw error;
    }
  }


  getTakesForOneTest(testId: string) {
    const takeCollection = this.firestore.collectionGroup<Take>('takes', ref => ref.where('testId', '==', testId));
    return takeCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Take;
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
