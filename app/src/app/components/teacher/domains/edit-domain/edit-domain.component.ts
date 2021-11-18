import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Domain } from 'src/app/models/domain.model';

@Component({
  selector: 'app-edit-domain',
  templateUrl: './edit-domain.component.html',
  styleUrls: ['./edit-domain.component.css']
})
export class EditDomainComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Domain) { }

  ngOnInit(): void {
  }

}
