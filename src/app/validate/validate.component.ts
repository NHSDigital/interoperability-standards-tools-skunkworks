import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { DatePipe } from '@angular/common';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import { TdDialogService } from '@covalent/core/dialogs';
import {FhirResource, OperationOutcome, OperationOutcomeIssue, StructureDefinition} from "fhir/r4";
import {MatSort, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {switchAll} from "rxjs";

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss']
})
export class ValidateComponent implements OnInit {

    editorOptions = {theme: 'vs-dark', language: 'json'};

    markdown = `Only JSON is currently supported.`
    resource: any = undefined ;

    resourceType: string | undefined = undefined

    //validateUrl = 'http://localhost:9001/FHIR/R4'
    validateUrl = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/FHIR/R4'
    validateBaseUrl = 'https://validator.fhir.org/validate'

    protected readonly JSON = JSON;
    data: any;
    // @ts-ignore
    dataSource: MatTableDataSource<OperationOutcomeIssue> ;
    displayedColumns  = ['issue','location','details', 'diagnostic'];

    @ViewChild('hrSort') hrSort: MatSort | null | undefined;
    profile: StructureDefinition | undefined;
    profiles: StructureDefinition[] = [];
    constructor(
                private http: HttpClient,
                private _dialogService: TdDialogService) { }
   /* validateBase() {
        if (this.data !== undefined) {
            this.resource = JSON.parse(this.data)
            this.data = JSON.stringify(this.resource)
            console.log(this.data)
            this.http.post(this.validateBaseUrl, this.resource).subscribe(result => {
                console.log(result)
                if (result !== undefined) {
                    var parameters = result as OperationOutcome

                    this.dataSource = new MatTableDataSource<OperationOutcomeIssue>(parameters.issue)
                }
            })
        }
    }

    */
    validate() {
        if (this.data !== undefined) {

            let headers = new HttpHeaders(
            );
            this.data = JSON.stringify(this.resource, undefined, 2)
            this.resource = JSON.parse(this.data)
            headers = headers.append('Content-Type', 'application/json');
            var url: string = this.validateUrl + '/$validate';
            if (this.profile !== undefined) url = url + '?profile='+this.profile.url
            this.http.post(url, this.data,{ headers}).subscribe(result => {
                if (result !== undefined) {
                    var parameters = result as OperationOutcome

                    for(let issue of parameters.issue) {
                        this.fixLocation(issue)
                    }

                    this.dataSource = new MatTableDataSource<OperationOutcomeIssue>(parameters.issue)
                    this.setSortHR()
                }
            },
                error => {
                    console.log(JSON.stringify(error))
                    this._dialogService.openAlert({
                        title: 'Alert',
                        disableClose: true,
                        message:
                            this.getErrorMessage(error),
                    });
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
                case 'details' : {
                    if (item.details !== undefined
                        && item.details.coding !== undefined
                        && item.details.coding.length > 0
                        && item.details.coding[0].code !== undefined) return item.details.coding[0].code
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

    checkType() {
        try {
            this.resource = JSON.parse(this.data)
            // ensure previous results are cleared
            this.dataSource = new MatTableDataSource<OperationOutcomeIssue>()
            if (this.resource !== undefined
            && this.resource.resourceType !== undefined
            && this.resource.resourceType !== this.resourceType) {
                this.resourceType = this.resource.resourceType
                const url: string = this.validateUrl + '/StructureDefinition?type='+this.resourceType;
                const headers = new HttpHeaders();

                this.http.get<any>(url, {headers}).subscribe(bundle => {
                    if (bundle.entry !== undefined) {
                        this.profiles = []
                        for (const entry of bundle.entry) {
                            if (entry.resource !== undefined && entry.resource.resourceType === 'StructureDefinition') {
                                this.profiles.push(entry.resource as StructureDefinition);
                            }
                        }
                    }
                }
                )
            }
        }
        catch (e) {

        }
    }
    getErrorMessage(error: any) {
        var errorMsg = ''
        if (error.error !== undefined){

            if (error.error.issue !== undefined) {
                errorMsg += ' ' + error.error.issue[0].diagnostics
            }
        }
        errorMsg += '\n\n ' + error.message
        return errorMsg;
    }

    protected readonly undefined = undefined;




    private fixLocation( issue: OperationOutcomeIssue) :OperationOutcomeIssue {
        /*
        * THIS IS GOING TO BE REALLY COARSE but better than nothing */
        var newRow : number | undefined = undefined
        var newCol : number | undefined = undefined
        var lines = this.data.split(/\r?\n|\r|\n/g);
        if (issue.location !== undefined && issue.location.length>0) {
            var location = issue.location[0].split(".")[1]
            if (location !== undefined) {
                var arrayNumber : number | undefined = undefined
                if (location.split('[').length>1) {
                    arrayNumber = +(location.split('[')[1].split(']')[0])
                    console.log(arrayNumber)
                }
                location = location.split('[')[0]
                console.log(location)


               // console.log(location)
                var found = false
                var inArray = false
                lines.forEach(( value: string,index: number) => {
                        //console.log(value.trim().replace('\"',''))

                        if (!found && (
                            (value.trim().replace('\"','').startsWith(location))
                            ||
                            (inArray && value.startsWith('    {')))
                        ) {
                            if (arrayNumber === undefined) {
                                found = true
                                newRow = index + 1
                                newCol = 0
                            } else {
                                if (0 === arrayNumber) {
                                    found = true
                                    newRow = index + 1
                                    newCol = 0
                                } else {
                                    inArray = true
                                    if (value.includes('{')) arrayNumber--

                                }
                            }
                        }
                    }
                )
                if (issue.extension !== undefined) {
                    if (newRow !== undefined && newCol !== undefined) {
                        for (let extension of issue.extension) {
                            if (extension.url === 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col') {
                                extension.valueInteger = newCol
                            }
                            if (extension.url === 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-row') {
                                extension.valueInteger = newRow
                            }
                        }
                        if (issue.location !== undefined && issue.location.length > 1) {
                            issue.location[1] = 'Line[' + newRow + '] Col[' + newCol + ']'
                        }
                    } else {
                        if (issue.location !== undefined && issue.location.length > 1) {
                            issue.location[1] = ''
                        }
                    }
                }
            }
        }

        return issue
    }


}
