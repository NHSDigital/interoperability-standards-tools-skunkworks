import {AfterViewInit, Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { TdDialogService } from '@covalent/core/dialogs';
import {CapabilityStatement, OperationOutcomeIssue, StructureDefinition} from "fhir/r4";
import {MatSort, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";
import {ConfigService} from "../service/config.service";


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
    cs : CapabilityStatement | undefined

    files: any;

    fileList : FileList | undefined
    fileLoadedFile: EventEmitter<any> = new EventEmitter();

    overlayStarSyntax = false;
    profileUrl: string | undefined;

    constructor(
                private http: HttpClient,
                private config: ConfigService,
                private _dialogService: TdDialogService,
                private _loadingService: TdLoadingService) { }

    ngAfterViewInit(): void {

    }
    ngOnInit(): void {
        this.http.get(this.config.validateUrl + '/R4/metadata').subscribe((result) => {
            if (result !== undefined) {
                this.cs = result as CapabilityStatement
            }
        })
    }

    validate() {
        if (this.test !== undefined) {
            this.test.nativeElement.scrollIntoView({behavior: 'smooth'});
        }

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











    announceSortChange($event: Sort) {

    }

    checkType() {
        this.clearReources()
        this.fileList= undefined
        try {
            this.resource = JSON.parse(this.data)
            if (this.editorOptions.language !== 'json') this.editorOptions.language = 'json';

            // ensure previous results are cleared
            this.dataSource = new MatTableDataSource<OperationOutcomeIssue>()
            if (this.resource !== undefined
            && this.resource.resourceType !== undefined
            && this.resource.resourceType !== this.resourceType) {
                this.resourceType = this.resource.resourceType
                const url: string = this.config.validateUrl + '/R4/StructureDefinition?type='+this.resourceType;
                const headers = new HttpHeaders();

                this.http.get<any>(url, {headers}).subscribe(bundle => {
                    if (bundle.entry !== undefined) {
                        var defaultProfile : string | undefined
                        if (this.cs !== undefined && this.cs.rest !== undefined){
                            this.cs.rest.forEach(value =>{
                                if (value.resource !== undefined) {
                                    value.resource.forEach(resource => {
                                        if (resource.type === this.resourceType) {
                                            defaultProfile = resource.profile
                                            this.profileUrl = this.fixUrl(defaultProfile)
                                        }
                                    })
                                }
                            })
                        }
                        this.profiles = []
                        for (const entry of bundle.entry) {
                            if (entry.resource !== undefined && entry.resource.resourceType === 'StructureDefinition') {
                                this.profiles.push(entry.resource as StructureDefinition);
                                if (defaultProfile !== undefined && defaultProfile === entry.resource.url) {
                                    this.profile = entry.resource
                                }
                            }
                        }

                    }
                }
                )
            }
        }
        catch (e) {
            this.resourceType = undefined
            if (this.editorOptions.language !== 'xml') this.editorOptions.language = 'xml';
            this.resource = this.data
            this.dataSource = new MatTableDataSource<OperationOutcomeIssue>()
        }
    }

    selectFileEvent(file: File | FileList) {
        this.clearSelection()
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
        this.resourceType = undefined
        this.profile = undefined
        this.profileUrl = undefined
        this.fileList = undefined
        this.clearReources()
    }
    clearReources(){
        this.resources = []
    }

    convertJSON() {
        this.clearSelection()
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        var url: string = this.config.validateUrl + '/R4/$convert';
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
                        this.config.getErrorMessage(error),
                });
            })
    }

    onInit(editor) {
        this.monacoEditor = editor
    }


    convertSTU3JSON() {
        this.clearSelection()
        let headers = new HttpHeaders(
        );
        headers = headers.append('Content-Type', 'application/xml');
        headers = headers.append('Accept', 'application/json');
        var url: string = this.config.validateUrl + '/STU3/$convertR4';
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
                        this.config.getErrorMessage(error),
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
        this.clearReources()
        this.profileUrl = this.fixUrl(this.profile?.url)
        
    }

    fixUrl(url): string {
        if (url.includes('http://hl7.org/fhir')) {
            return url
        }
        if (url.includes('http://hl7.eu/fhir')) {
            return url
        }
        let packageStr = 'fhir.r4.nhsengland.stu1'
        return 'https://simplifier.net/resolve?fhirVersion=R4&scope='+ packageStr  + '&canonical='+url
    }
}
