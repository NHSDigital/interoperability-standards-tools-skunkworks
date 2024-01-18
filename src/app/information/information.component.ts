import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import {TdLoadingService} from "@covalent/core/loading";
import {
  CapabilityStatement,
  CapabilityStatementRestResource,
  ImplementationGuide,
  OperationOutcomeIssue
} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort, Sort} from "@angular/material/sort";

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit{
  validateUrl = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/FHIR/R4'
  @ViewChild('hrSort') hrSort: MatSort | null | undefined;
  // @ts-ignore
  dataSource: MatTableDataSource<CapabilityStatementRestResource> ;
  displayedColumns  = ['resource','profile','imposeProfile'];
  // @ts-ignore
  dataSourceIG: MatTableDataSource<ImplementationGuide> ;
  displayedColumnsIG  = ['package','version'];
  constructor(
      private http: HttpClient,
      private _dialogService: TdDialogService,
      private _loadingService: TdLoadingService) { }

  ngOnInit(): void {
    this.http.get(this.validateUrl + '/metadata').subscribe((result) => {
      console.log(result)
      if (result !== undefined) {
        var cs = result as CapabilityStatement
        if (cs.contained !== undefined) {
          // @ts-ignore
          this.dataSourceIG = new MatTableDataSource<ImplementationGuide>(cs.contained)
        }
        if (cs.rest !== undefined) {
          for (const rest of cs.rest) {
             if (rest.resource !== undefined) {
                this.dataSource = new MatTableDataSource<CapabilityStatementRestResource>(rest.resource)
               this.setSort()
             }

          }
        }

      }
    }
    )
  }

  setSort() {

    // @ts-ignore
    this.dataSource.sort = this.hrSort

    this.dataSource.sortingDataAccessor = (item , property) => {
      console.log(property)
      switch (property) {
        case 'resource': {
         if (item.type !== undefined) return item.type
          return undefined
        }

        case 'profile': {
          if (item.profile !== undefined) return item.profile
          return ''
        }
        case 'details' : {
          if (item.extension !== undefined
              && item.extension.length >0 && item.extension[0].valueCanonical !== undefined) return item.extension[0].valueCanonical
          return ''
        }
        default: {
          return 0
        }
      }
    };
  }

  protected readonly undefined = undefined;

  announceSortChange($event: Sort) {

  }
}
