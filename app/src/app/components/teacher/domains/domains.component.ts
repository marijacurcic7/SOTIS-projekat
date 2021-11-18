import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Domain } from 'src/app/models/domain.model';
import { DomainService } from 'src/app/services/domain.service';
import { AddDomainComponent } from './add-domain/add-domain.component';
import { DeleteDomainComponent } from './delete-domain/delete-domain.component';
import { EditDomainComponent } from './edit-domain/edit-domain.component';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit {

  domains$: Observable<Domain[]>

  constructor(
    private dialog: MatDialog,
    private domainService: DomainService
  ) { }

  ngOnInit(): void {
    this.domains$ = this.domainService.getDomains()
  }

  createNewDomain() {
    const dialogRef = this.dialog.open(AddDomainComponent, {
    })

    dialogRef.afterClosed().subscribe(async domainName => {
      if (domainName) {
        await this.domainService.addDomain(domainName)
      }
    })
  }
  editDomain(event: Event, domain: Domain) {
    event.stopPropagation()
    const dialogRef = this.dialog.open(EditDomainComponent, {
      data: domain
    })
    dialogRef.afterClosed().subscribe(async domain => {
      if (domain) {
        await this.domainService.editDomain(domain)
      }
    })
  }
  deleteDomain(event: Event, domain: Domain) {
    event.stopPropagation()
    const dialogRef = this.dialog.open(DeleteDomainComponent, {
      data: domain
    })
    dialogRef.afterClosed().subscribe(async domain => {
      if (domain) {
        await this.domainService.deleteDomain(domain)
      }
    })
  }
}
