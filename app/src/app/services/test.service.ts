import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from '@firebase/util';
import { Answer } from '../models/answer.model';
import { Question } from '../models/question.model';
import { Test } from '../models/test.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
  ) { }

  async addTest(test: Test, questions: Question[], answers: Answer[]) {
    try {
      // number of questions should be the same as number of answers
      if (questions.length !== answers.length) throw new Error('different number of Q & A')
      // check total number of points in a test
      const sumOfQuestionsPoints = questions.map(q => q.maxPoints).reduce((prev, next) => prev + next)
      if (test.maxPoints !== sumOfQuestionsPoints) throw new Error('total number of points is different')

      // write test to firestore
      const docRef = await this.firestore.collection('tests').add(test)

      // write Q & A to firestore
      for (let index = 0; index < questions.length; index++) {
        // write question to firestore
        await this.firestore
          .collection(`tests/${docRef.id}/questions`)
          .doc(`${index}`)
          .set(questions[index])

        // write corresponding answer to firestore
        await this.firestore
          .collection(`tests/${docRef.id}/answers`)
          .doc(`${index}`)
          .set(answers[index])
      }
      this.openSuccessSnackBar('test succesfully saved.')
    } catch (error) {
      if (error instanceof FirebaseError) this.openFailSnackBar(error.code)
      else this.openFailSnackBar()
      throw error
    }
  }

  getTests(teacherId: string) {
    const testsCollection = this.firestore.collection<Test>('tests', ref =>
      ref.where('createdBy.teacherId', '==', teacherId)
    );
    return testsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Test;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }

  getAllTests() {
    const testsCollection = this.firestore.collection<Test>('tests');
    
    return testsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Test;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }

  getTest(testId: string) {
    const test = this.firestore.doc<Test>(`tests/${testId}`);

    return test.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Test;
        const id = a.payload.id;
        data.id = id;
        return data;
      })
    )
  }

  getQuestions(testId: string) {
    const questionsCollection = this.firestore.collection<Question>(`tests/${testId}/questions`);
    return questionsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Question;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }
  getAnswers(testId: string) {
    const answersCollection = this.firestore.collection<Answer>(`tests/${testId}/answers`);
    return answersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Answer;
        const id = a.payload.doc.id;
        data.id = id;
        return data;
      }))
    )
  }

  getAnswer(testId: string, questionId: string) {
    const answer = this.firestore.doc<Answer>(`tests/${testId}/answers/${questionId}`);

    return answer.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Answer;
        const id = a.payload.id;
        data.id = id;
        return data;
      })
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
