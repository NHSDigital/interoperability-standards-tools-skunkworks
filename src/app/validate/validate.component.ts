import {AfterViewInit, Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { TdDialogService } from '@covalent/core/dialogs';
import {OperationOutcomeIssue, StructureDefinition} from "fhir/r4";
import {MatSort, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";


class Resource {
    fileName : string = 'Not specified'
    resource : any
}

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss']
})
export class ValidateComponent implements OnInit, AfterViewInit {

    @ViewChild('test') test: any | null | undefined;
    @ViewChild('editorComponent') editorComponent: any | null | undefined;

    editorOptions = {theme: 'vs-dark', language: 'json'};
    editor: any;

    markdown = `Only JSON is fully supported.`
    resource: any = undefined ;

    resources: Resource[] = []

    monacoEditor : any

    resourceType: string | undefined = undefined

    //validateUrl = 'http://localhost:9001/FHIR/R4'
    validateUrl = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/FHIR'
    validateBaseUrl = 'https://validator.fhir.org/validate'

    protected readonly JSON = JSON;
    data: any;
    // @ts-ignore
    dataSource: MatTableDataSource<OperationOutcomeIssue> ;
    displayedColumns  = ['issue','location','details', 'diagnostic'];

    imposeProfiles : any = true;
    @ViewChild('hrSort') hrSort: MatSort | null | undefined;
    profile: StructureDefinition | undefined;
    profiles: StructureDefinition[] = [];

    loadingMode = LoadingMode;
    loadingStrategy = LoadingStrategy;
    loadingType = LoadingType;

    information : number = 0
    warning : number = 0
    error : number = 0

    files: any;

    fileList : FileList | undefined
    fileLoadedFile: EventEmitter<any> = new EventEmitter();

    overlayStarSyntax = false;
    profileUrl: string | undefined;

    constructor(
                private http: HttpClient,
                private _dialogService: TdDialogService,
                private _loadingService: TdLoadingService) { }

    ngAfterViewInit(): void {

    }
    ngOnInit(): void {
      //  if (this.monacoComponent !== null) console.log(this.monacoComponent)
    }

    validate() {
        if (this.test !== undefined) {
            this.test.nativeElement.scrollIntoView({behavior: 'smooth'});
        }

        this.clearResults()

        if (this.data !== undefined) {

           var res : Resource = {
               resource: this.resource,
               fileName: 'Not Specified'
           }

            this.resources.push(res)
        } else if (this.fileList !== undefined) {

            for (let i = 0; i < this.fileList.length; i++) {
                this.processFile(this.fileList.item(i))
            }
        }
    }
    processFile(file: File | null) {
        if (file !== null) {
            var fileLoaded: EventEmitter<any> = new EventEmitter();
            const reader = new FileReader();
            reader.readAsBinaryString(file);
            fileLoaded.subscribe((data: any) => {
                    var res : Resource = {
                        resource: JSON.parse(data),
                        fileName: file.name
                    }
                    this.resources.push(res)
                }
            );
            const me = this;
            reader.onload = (event: Event) => {
                if (reader.result instanceof ArrayBuffer) {
                    console.log('array buffer');

                    // @ts-ignore
                    fileLoaded.emit(String.fromCharCode.apply(null, reader.result));
                } else {
                    console.log('not a buffer');
                    if (reader.result !== null) fileLoaded.emit(reader.result);
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                me._dialogService.openAlert({
                    title: 'Alert',
                    disableClose: true,
                    message:
                        'Failed to process file. Try smaller example?',
                });
            };
        }
    }

    clearResults(){
        this.resources = []
    }



    getFHIRDateString(date : Date) : string {
        var datePipe = new DatePipe('en-GB');
        //2023-05-12T13:22:31.964Z
        var utc = datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSZZZZZ');
        if (utc!= null) return utc
        return date.toISOString()
    }





    announceSortChange($event: Sort) {

    }

    checkType() {
        try {
            this.resource = JSON.parse(this.data)
            this.editorOptions = {theme: 'vs-dark', language: 'json'};
            // ensure previous results are cleared
            this.dataSource = new MatTableDataSource<OperationOutcomeIssue>()
            if (this.resource !== undefined
            && this.resource.resourceType !== undefined
            && this.resource.resourceType !== this.resourceType) {
                this.resourceType = this.resource.resourceType
                const url: string = this.validateUrl + '/R4/StructureDefinition?type='+this.resourceType;
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
            this.resourceType = undefined
            this.editorOptions = {theme: 'vs-dark', language: 'xml'};
            this.resource = this.data
            this.dataSource = new MatTableDataSource<OperationOutcomeIssue>()
        }
    }

    selectFileEvent(file: File | FileList) {
        this.clearResults()
        if (file instanceof FileList) {
            this.fileList = file
            this.data = undefined

        } else {
            this.fileList = undefined
            const reader = new FileReader();
            reader.readAsBinaryString(file);
            this.fileLoadedFile.subscribe( (data: any) => {
                   this.data = data
                }
            );
            const me = this;
            reader.onload = (event: Event) => {
                if (reader.result instanceof ArrayBuffer) {
                    ///console.log('array buffer');

                    // @ts-ignore
                    me.fileLoaded.emit(String.fromCharCode.apply(null, reader.result));
                } else {
                   // console.log('not a buffer');
                    if (reader.result !== null) me.fileLoadedFile.emit(reader.result);
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                me._dialogService.openAlert({
                    title: 'Alert',
                    disableClose: true,
                    message:
                        'Failed to process file. Try smaller example?',
                });
            };
        }

    }

    clearSelection() {
        this.fileList = undefined
    }

    convertJSON() {
        this.clearResults()
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        var url: string = this.validateUrl + '/R4/$convert';
        this.http.post(url, this.data,{ headers}).subscribe(result => {

                if (result !== undefined) {
                    this.data = JSON.stringify(result, undefined, 2)
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

    onInit(editor) {
        this.monacoEditor = editor
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

    convertSTU3JSON() {
        this.clearResults()
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        var url: string = this.validateUrl + '/STU3/$convertR4';
        this.http.post(url, this.data,{ headers}).subscribe(result => {

                if (result !== undefined) {
                    this.data = JSON.stringify(result, undefined, 2)
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

    setPosition(position) {
        this.monacoEditor.setPosition(position)
        if (this.editorComponent !== undefined) {
            this.editorComponent.nativeElement.scrollIntoView({behavior: 'smooth'});
            //this.monacoEditor.focus()
        }
    }


    applyProfile(event: any) {
        console.log(event)
        console.log(this.profile)
        this.profileUrl = this.fixUrl(this.profile?.url)
        
    }

    fixUrl(url): string {
        if (url.includes('http://hl7.org/fhir')) {
            return url
        }
        let packageStr = 'fhir.r4.nhsengland.stu1'
        return 'https://simplifier.net/resolve?fhirVersion=R4&scope='+ packageStr  + '&canonical='+url
    }
}
