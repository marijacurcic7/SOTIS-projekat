import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Domain } from 'src/app/models/domain.model';

@Component({
  selector: 'app-delete-domain',
  templateUrl: './delete-domain.component.html',
  styleUrls: ['./delete-domain.component.css']
})
export class DeleteDomainComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Domain) { }

  ngOnInit(): void {
  }

}
