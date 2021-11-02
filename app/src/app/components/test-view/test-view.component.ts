import { Component, OnInit } from '@angular/core';
import { Question } from 'src/app/models/question.model';
import { Test } from 'src/app/models/test.model';

@Component({
  selector: 'app-test-view',
  templateUrl: './test-view.component.html',
  styleUrls: ['./test-view.component.css']
})
export class TestViewComponent implements OnInit {

  test: Test;
  questions: Question[];
  displayedColumns: string[] = ['text', 'points', 'edit', 'delete'];


  constructor() { }

  ngOnInit(): void {
    const dummyTest: Test = {
      name: 'ime testa',
      topic: 'web programiranje',
      maxPoints: 3,
      createdBy: {
        displayName: "teacher name",
        teacherId: "teacher id"
      },
    }
    this.test = dummyTest;
  }

}
