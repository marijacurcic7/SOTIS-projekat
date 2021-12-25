import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseError } from '@firebase/app';
import { MyAnswer } from '../models/my-answer.model';
import { Question } from '../models/question.model';
import { Take } from '../models/take.model';
import { map, take } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { TestService } from './test.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class TakeService {

  constructor(
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private testService: TestService,
    private router: Router,
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
          .collection(`users/${uid}/takes/${docRef.id}/my-answers`)
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
    const questionsCollection = this.firestore.collection<MyAnswer>(`users/${userId}/takes/${takeId}/my-answers`);
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
    return this.firestore.doc<MyAnswer>(`users/${userId}/takes/${takeId}/my-answers/${questionId}`).valueChanges();

    // return answer.snapshotChanges().pipe(
    //   map(a => {
    //     const data = a.payload.data() as MyAnswer;
    //     const id = a.payload.id;
    //     data.id = id;
    //     return data;
    //   })
    // )
  }

  updateMyAnswer(takeId: string, userId: string, questionId: string, myAnswer: MyAnswer) {
    return this.firestore.doc<MyAnswer>(`users/${userId}/takes/${takeId}/my-answers/${questionId}`).set(myAnswer);

  }

  updateTake(takeId: string, userId: string, take: Take) {
    return this.firestore.doc<Take>(`users/${userId}/takes/${takeId}`).set(take);

  }

  finishTake(takeId: string, user: User, testId: string) {


    try {
      const endTime = firebase.firestore.Timestamp.fromDate(new Date());
      let totalPoints = 0;

      this.testService.getAnswers(testId).pipe(take(1)).subscribe(correctAnswers => {
        if (!correctAnswers) return;
        console.log(correctAnswers);

        this.getMyAnswers(takeId, user.uid).pipe(take(1)).subscribe(myAnswers => {
          console.log(myAnswers);

          this.testService.getQuestions(testId).pipe(take(1)).subscribe(async questions => {
            console.log(questions);
            var maxTestPoints = 0;
            correctAnswers.forEach(async (correctAnswer, index) => {
              const correctAnswersForAQuestion = correctAnswer.correctAnswers.sort();

              if (!myAnswers[index]) return;
              const myAnswersForAQuestion = myAnswers[index].myAnswers.sort();
              const maxPoints = questions[Number(myAnswers[index].id)].maxPoints;
              console.log(maxPoints);
              console.log(myAnswersForAQuestion);
              const isEveryAnswerForAQuestionCorrect = correctAnswersForAQuestion.every((ans, i) => ans === myAnswersForAQuestion[i]);
              if (isEveryAnswerForAQuestionCorrect) {
                totalPoints += maxPoints;
                myAnswers[index].points = maxPoints;
                myAnswers[index].correct = true;
              }
              else {
                myAnswers[index].points = 0;
                myAnswers[index].correct = false;
              }
              maxTestPoints += maxPoints;
              await this.updateMyAnswer(takeId, user.uid, String(index), myAnswers[index]);
              console.log(myAnswers[index]);
            });
            console.log(totalPoints);

            await this.firestore.doc<Take>(`users/${user.uid}/takes/${takeId}`).update({
              endTime: firebase.firestore.Timestamp.fromDate(new Date()),
              points: totalPoints,
              passed: totalPoints / maxTestPoints >= 0.5,
              user: {
                displayName: user.displayName,
                uid: user.uid
              }
            });
            this.router.navigate([`/take-test/${testId}/take/${takeId}/results`]);
          });

        });
      });
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
