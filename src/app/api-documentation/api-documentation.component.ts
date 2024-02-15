import {AfterContentInit, Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import pdqm from './CapabilityStatement/ihe-pdqm.json'
import mhdDocumentResponder from './CapabilityStatement/ihe-mhd-documentresponder.uk.json'
import mcsd from './CapabilityStatement/ihe-mcsd-selective-supplier-uk.json'
import careconnectAPI from './CapabilityStatement/careconnect-api-server.json'
import ukcoreClinical from './CapabilityStatement/hl7uk-ukcore-fhir-access-clinical.json'
import ukcorePatient from './CapabilityStatement/hl7uk-ukcore-fhir-access-patient.json'
import SwaggerUI from 'swagger-ui';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import {ConfigService} from "../config.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {
  Bundle,
  CapabilityStatement
} from "fhir/r4";
import {MatDialog} from "@angular/material/dialog";
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";
@Component({
  selector: 'app-api-documentation',
  templateUrl: './api-documentation.component.html',
  styleUrls: ['./api-documentation.component.scss']
})
export class ApiDocumentationComponent implements AfterContentInit, OnInit {

  @ViewChild('editorComponent') editorComponent: any | null | undefined;
  data: any;
  oas: any;
  oasOnly=false;
  oasInput = false;
  monacoEditor : any
  capabilityStatements: CapabilityStatement[] =[]
  editorOptions = {theme: 'vs-dark', language: 'json'};
  fileLoadedFile: EventEmitter<any> = new EventEmitter();

  markdown = `This page is only designed for CapabilityStatements which include [FHIR Interactions](https://hl7.org/fhir/R4/exchange-module.html) or Open API Specification (OAS). \nEither paste in the JSON/XML/YAML resource or select a starter from the list below. \n\n Several of the CapabilityStatements listed here are from 'Enterprise Integrations', see menu for links.`
  onInit(editor) {
    this.monacoEditor = editor
  }

  @ViewChild('swagger',{static: true}) swagger: ElementRef | undefined

  apiDocumentation = careconnectAPI
  capabilityStatement: CapabilityStatement | undefined;

  fileUrl;
  file: any;

  constructor(
      private http: HttpClient,
      private route: ActivatedRoute,
      private router: Router,
      private config: ConfigService,
      private _dialogService: TdDialogService,
      private sanitizer: DomSanitizer,
      public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.router.events.forEach((event) => {
      if(event instanceof NavigationStart
      ) {
        console.log('CHANGE')
        this.oasOnly = false
      }

    });
    this.capabilityStatements = []
    this.capabilityStatements.push(mhdDocumentResponder as CapabilityStatement)
    this.capabilityStatements.push(ukcoreClinical as CapabilityStatement)
    this.capabilityStatements.push(pdqm as CapabilityStatement)
    this.capabilityStatements.push(mcsd as CapabilityStatement)
    this.capabilityStatements.push(careconnectAPI as CapabilityStatement)
    this.capabilityStatements.push(ukcorePatient as CapabilityStatement)
    this.oasOnly = false
    this.http.get(this.config.validateUrl() + '/CapabilityStatement').subscribe((result) => {

          if (result !== undefined) {
            let bundle = result as Bundle
            if (bundle.entry !== undefined) {
              for(let entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType ==='CapabilityStatement') {
                  this.capabilityStatements.push(entry.resource)
                }
              }
            }
          }
        }
    )

    this.route.queryParamMap.subscribe(params => {
          const urlParam = params.get('url');

          if (urlParam !== undefined && urlParam !== null) {

            var found = false
            for (let capabilityStatement of this.capabilityStatements) {
              if (decodeURI(urlParam as string) === capabilityStatement.url) {
                found = true
                console.log(capabilityStatement)
                this.capabilityStatement = capabilityStatement
                this.data = JSON.stringify(capabilityStatement, undefined, 2)
                this.applyStatement(capabilityStatement)
              }
            }
            if (!found) {
              this.http.get(this.config.validateUrl() + '/CapabilityStatement?url=' + decodeURI(urlParam as string)).subscribe((result) => {
                    console.log(result)
                    if (result !== undefined) {
                      let bundle = result as Bundle
                      if (bundle.entry !== undefined && bundle.entry.length > 0) {
                        this.capabilityStatement = bundle.entry[0].resource as CapabilityStatement
                        this.data = JSON.stringify(bundle.entry[0].resource as CapabilityStatement, undefined, 2)
                        if (this.data !== undefined) this.applyStatement(bundle.entry[0].resource as CapabilityStatement)
                      }
                    }
                  }
              )
            }
          }
        }
    )
  }

  ngAfterContentInit(): void {
    if (this.capabilityStatement === undefined) {
      this.applyStatement(careconnectAPI as CapabilityStatement)
    }
  }

  checkType() {
    this.oasInput = false
    try {
      let resource = JSON.parse(this.data)
      if (resource.openapi !== undefined) {
          this.oasInput = true
      }
      if (this.editorOptions.language !== 'json') this.editorOptions.language = 'json';
    } catch (e) {
      console.log('swapped to XML')
      var strs = (this.data as string).split('\n')
      var isYaml=false
      for (let str of strs) {
        if (str.startsWith('openapi')) {
          isYaml = true
          this.oasInput = true
        }
        if (str.includes('"openapi":')) this.oasInput = true
      }
      if (isYaml) {
        if (this.editorOptions.language !== 'yaml') this.editorOptions.language = 'yaml';
      } else {
        if (this.editorOptions.language !== 'xml') this.editorOptions.language = 'xml';
      }
    }
  }


  applyStatement(option: CapabilityStatement) {
    this.data = JSON.stringify(option,undefined,2)
    this.showOAS()
  }
  showOAS() {
    if (this.oasInput) {
      this.sortOAS()
    } else {
      this.oas = undefined
      if ((this.data as string).startsWith('{')) {
        this.showOASHttp()
      } else {
        this.convertJSON()
      }
    }
  }

  sortOAS() {
    let headers = new HttpHeaders(
    );
    if (this.editorOptions.language === 'yaml') {
      headers = headers.append('Content-Type', 'application/x-yaml');
    } else {
      headers = headers.append('Content-Type', 'application/json');
    }
    headers = headers.append('Accept', 'application/json');
    var url: string = this.config.validateUrl() + '/$convertOAS';


    this.http.post(url, this.data,{ headers}).subscribe(result => {

          this.viewOAS(result)
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

  viewOAS(result : Object) {
    this.oas = result

    var spec = result

    try {
      var fixServer = spec as any

      if (fixServer.openapi !== undefined && (fixServer.servers === undefined || fixServer.servers.length ===0 || fixServer.servers[0].url === undefined)) {
        fixServer.servers = [
          {
            "url": "https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/clinicaldatasharing/FHIR/R4",
            "description": "Proof of Concept for EPR FHIR Reference Implementation Server (AWS FHIRWorks)"
          },
          {
            "url": "https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/FHIR/R4",
            "description": "Proof of Concept for Orchestration/TIE FHIR Reference Implementation Server (AWS FHIRWorks)"
          }
        ]
        spec = fixServer
      }
    } catch (e) {

    }
    const ui = SwaggerUI({
      spec: spec,
      domNode: this.swagger?.nativeElement,
      deepLinking: false,
      presets: [
        SwaggerUI.presets.apis
      ],
    });
    this.swagger?.nativeElement.scrollIntoView({behavior: 'smooth'});
  }
  showOASHttp() {
    let headers = new HttpHeaders(
    );
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Accept', 'application/json');
    var url: string = this.config.validateUrl() + '/CapabilityStatement/$openapi';

    this.http.post(url, this.data,{ headers}).subscribe(result => {
          this.viewOAS(result)
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
  convertJSON() {
    let headers = new HttpHeaders(
    );
    headers = headers.append('Content-Type', 'application/xml');
    headers = headers.append('Accept', 'application/json');
    var url: string = this.config.validateUrl() + '/$convert';
    this.http.post(url, this.data,{ headers}).subscribe(result => {

          if (result !== undefined) {
            this.data = JSON.stringify(result, undefined, 2)
            this.showOASHttp()
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



  downloadOAS(): SafeResourceUrl {
    const data = JSON.stringify(this.oas,undefined,2);
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });

    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  downloadCapabilityStatement() {
    const data = this.data
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });

    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  convertoFHIR() {
    let headers = new HttpHeaders(
    );
    if (this.editorOptions.language === 'yaml') {
      headers = headers.append('Content-Type', 'application/x-yaml');
    } else {
      headers = headers.append('Content-Type', 'application/json');
    }
    headers = headers.append('Accept', 'application/json');
    var url: string = this.config.validateUrl() + '/$convertOAStoFHIR';
    this.http.post(url, this.data,{ headers}).subscribe(result => {

          if (result !== undefined) {
            this.data = JSON.stringify(result, undefined, 2)
            this.showOASHttp()
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

  selectFileEvent(file: File | FileList) {
    if (file instanceof File) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      this.fileLoadedFile.subscribe((data: any) => {
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

  openInfo() {
    let dialogRef = this.dialog.open(InfoDiaglogComponent, {
      width: '400px',
      data:  this.markdown
    });

  }


}
