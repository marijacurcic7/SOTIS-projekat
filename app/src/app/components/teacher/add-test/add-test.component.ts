import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  text: string;
  maxPoints: number;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
}

@Component({
  selector: 'app-add-test',
  templateUrl: './add-test.component.html',
  styleUrls: ['./add-test.component.css']
})
export class AddTestComponent implements OnInit {

  name: string;
  topic: string;
  text: string;

  constructor(public dialog: MatDialog) { }

  questionDialog(): void {
    const dialogRef = this.dialog.open(QuestionDialog, {
      width: '800px',
      data: {text: this.text},
      // panelClass: 'custom-modalbox'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.text = result;
    });
  }

  ngOnInit(): void {
  }

}

@Component({
  selector: 'question-dialog',
  templateUrl: 'question-dialog.html',
  styleUrls: ['./add-test.component.css']
})
export class QuestionDialog {

  constructor(
    public dialogRef: MatDialogRef<QuestionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
