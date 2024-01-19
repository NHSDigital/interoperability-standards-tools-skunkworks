import {AfterViewInit, Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { TdDialogService } from '@covalent/core/dialogs';
import {OperationOutcomeIssue, StructureDefinition} from "fhir/r4";
import {MatSort, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {EditorComponent} from "ngx-monaco-editor-v2";
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
    @ViewChild(EditorComponent, { static: false }) monacoComponent:EditorComponent| undefined;

    editorOptions = {theme: 'vs-dark', language: 'json'};
    editor: any;

    markdown = `Only JSON is currently supported.`
    resource: any = undefined ;

    resources: Resource[] = []

    resourceType: string | undefined = undefined

    //validateUrl = 'http://localhost:9001/FHIR/R4'
    validateUrl = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/FHIR/R4'
    validateBaseUrl = 'https://validator.fhir.org/validate'

    protected readonly JSON = JSON;
    data: any;
    // @ts-ignore
    dataSource: MatTableDataSource<OperationOutcomeIssue> ;
    displayedColumns  = ['issue','location','details', 'diagnostic'];

    imposeProfiles : any = false;
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
    constructor(
                private http: HttpClient,
                private _dialogService: TdDialogService,
                private _loadingService: TdLoadingService) { }

    ngAfterViewInit(): void {
        if (this.monacoComponent !== null) {
            console.log(this.monacoComponent)
        }
    }
    ngOnInit(): void {
      //  if (this.monacoComponent !== null) console.log(this.monacoComponent)
    }

    validate() {
        if (this.monacoComponent !== null && this.monacoComponent !== undefined) {
                // @ts-ignore
            var monaco = this.monacoComponent._editorContainer.nativeElement
            console.log(monaco);
           // console.log(monaco.div)
           // console.log(monaco.getModels())
        }
        this.resources = []

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


    protected readonly undefined = undefined;

    selectFileEvent(file: File | FileList) {

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
                    console.log('array buffer');

                    // @ts-ignore
                    me.fileLoaded.emit(String.fromCharCode.apply(null, reader.result));
                } else {
                    console.log('not a buffer');
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
}
