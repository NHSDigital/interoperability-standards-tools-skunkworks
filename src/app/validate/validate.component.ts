import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import { DatePipe } from '@angular/common';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import { TdDialogService } from '@covalent/core/dialogs';
import {FhirResource, OperationOutcome, OperationOutcomeIssue} from "fhir/r4";
import {MatSort, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {switchAll} from "rxjs";

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss']
})
export class ValidateComponent implements OnInit {

    editorOptions = {theme: 'vs-dark', language: 'javascript'};
    code: string= 'function x() {\nconsole.log("Hello world!");\n}';
    markdown = `TODO`
    resource: any = undefined ;

    validateUrl = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/FHIR/R4/$validate'
    validateBaseUrl = 'https://validator.fhir.org/validate'

    protected readonly JSON = JSON;
    data: any;
    // @ts-ignore
    dataSource: MatTableDataSource<OperationOutcomeIssue> ;
    displayedColumns  = ['issue','location', 'diagnostic'];

    @ViewChild('hrSort') hrSort: MatSort | null | undefined;
    constructor(
                private http: HttpClient,
                private _dialogService: TdDialogService) { }
    validateBase() {
        if (this.data !== undefined) {
            this.resource = JSON.parse(this.data)
            this.http.post(this.validateBaseUrl, this.resource).subscribe(result => {
                console.log(result)
                if (result !== undefined) {
                    var parameters = result as OperationOutcome

                    this.dataSource = new MatTableDataSource<OperationOutcomeIssue>(parameters.issue)
                }
            })
        }
    }
    validate() {
        if (this.data !== undefined) {
            this.resource = JSON.parse(this.data)
            this.http.post(this.validateUrl, this.resource).subscribe(result => {
                console.log(result)
                if (result !== undefined) {
                    var parameters = result as OperationOutcome

                    this.dataSource = new MatTableDataSource<OperationOutcomeIssue>(parameters.issue)
                    this.setSortHR()
                }
            })
        }
    }

    ngOnInit(): void {

    }

    getFHIRDateString(date : Date) : string {
        var datePipe = new DatePipe('en-GB');
        //2023-05-12T13:22:31.964Z
        var utc = datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSZZZZZ');
        if (utc!= null) return utc
        return date.toISOString()
    }

    showAlert(): void {
        this._dialogService.openAlert({
            title: 'BMI Risks',
            message:
                'For people of White heritage, a BMI:\n' +
                '\n' +
                'below 18.5 is underweight\n' +
                'between 18.5 and 24.9 is healthy\n' +
                'between 25 and 29.9 is overweight\n' +
                'of 30 or over is obese\n' +
                'Black, Asian and some other minority ethnic groups have a higher risk of developing some long-term conditions such as type 2 diabetes with a lower BMI. People from these groups with a BMI of:\n' +
                '\n' +
                '23 or more are at increased risk (overweight)\n' +
                '27.5 or more are at high risk (obese)',
        });
    }

    setSortHR() {

        // @ts-ignore
        this.dataSource.sort = this.hrSort

        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'issue': {
                    switch(item.severity) {
                        case "error": return 2
                        case "fatal": return 3
                        case "warning":return 1
                        default: return 0
                    }
                }
                case 'location': {
                    if (item.location !== undefined) return item.location[0]
                    return 0
                }

                default: {
                    return 0
                }
            }
        };
    }


    announceSortChange($event: Sort) {

    }

}
