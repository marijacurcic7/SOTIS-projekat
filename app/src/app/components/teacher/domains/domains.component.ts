import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddDomainComponent } from './add-domain/add-domain.component';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  createNewDomain() {
    const dialogRef = this.dialog.open(AddDomainComponent, {
      // width: ' 10rem',
    })

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        console.log(result)
      }
    })
  }
}
