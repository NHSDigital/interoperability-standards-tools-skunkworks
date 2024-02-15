import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import {TdLoadingService} from "@covalent/core/loading";
import {
  CapabilityStatement, CapabilityStatementMessagingSupportedMessage,
  CapabilityStatementRestResource,
  ImplementationGuide,
  OperationOutcomeIssue
} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort, Sort} from "@angular/material/sort";
import {ConfigService} from "../config.service";

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit{

  @ViewChild('hrSort') hrSort: MatSort | null | undefined;
  // @ts-ignore
  dataSource: MatTableDataSource<CapabilityStatementRestResource> ;
  displayedColumns  = ['resource','profile','supportedProfile','imposeProfile'];
  // @ts-ignore
  dataSourceIG: MatTableDataSource<ImplementationGuide> ;
  displayedColumnsIG  = ['package','version'];
  // @ts-ignore
  dataSourceMessage: MatTableDataSource<CapabilityStatementMessagingSupportedMessage> ;
  displayedColumnsMessage  = ['messageDefinition'];
  cs : CapabilityStatement | undefined
  constructor(
      private http: HttpClient,
      private config: ConfigService,
      private _dialogService: TdDialogService,
      private _loadingService: TdLoadingService) { }

  ngOnInit(): void {
    this.http.get(this.config.validateUrl() + '/metadata').subscribe((result) => {
      if (result !== undefined) {
        this.cs = result as CapabilityStatement
        if (this.cs.contained !== undefined) {
          // @ts-ignore
          this.dataSourceIG = new MatTableDataSource<ImplementationGuide>(this.cs.contained)
        }
        if (this.cs.messaging !== undefined && this.cs.messaging.length >0) {
          this.dataSourceMessage = new MatTableDataSource<CapabilityStatementMessagingSupportedMessage>(this.cs.messaging[0].supportedMessage)

        }
        if (this.cs.rest !== undefined) {
          for (const rest of this.cs.rest) {
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

    // @ts-ignore
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
