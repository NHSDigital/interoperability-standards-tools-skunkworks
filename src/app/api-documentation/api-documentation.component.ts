import {AfterContentInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import pdqm from './CapabilityStatement/pdqm-uk.json'
import mhdDocumentResponder from './CapabilityStatement/mhd-documentresponder.uk.json'
import sdcFormManager from './CapabilityStatement/sdc-formmanager.json'
import mcsd from './CapabilityStatement/mcsd-selective-supplier-uk.json'
import ukcoreClinical from './CapabilityStatement/ukcore-fhir-access-clinical.json'
import ukcorePatient from './CapabilityStatement/ukcore-fhir-access-patient.json'
import SwaggerUI from 'swagger-ui';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TdDialogService} from "@covalent/core/dialogs";
import {ConfigService} from "../service/config.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
@Component({
  selector: 'app-api-documentation',
  templateUrl: './api-documentation.component.html',
  styleUrls: ['./api-documentation.component.scss']
})
export class ApiDocumentationComponent implements AfterContentInit, OnInit {
  ngOnInit(): void {

  }
  @ViewChild('editorComponent') editorComponent: any | null | undefined;
  data: any;
  oas: any;
  monacoEditor : any
  editorOptions = {theme: 'vs-dark', language: 'json'};

  markdown = `This page is only designed for CapabilityStatements which include [FHIR Interactions](https://hl7.org/fhir/R4/exchange-module.html). Either paste in the JSON/XML resource or select a starter from the list below.`
  onInit(editor) {
    this.monacoEditor = editor
  }

  @ViewChild('swagger',{static: true}) swagger: ElementRef | undefined
  checkType() {
    try {
      let resource = JSON.parse(this.data)
      this.editorOptions = {theme: 'vs-dark', language: 'json'};
    } catch (e) {
      console.log('swapped to XML')
      this.editorOptions = {theme: 'vs-dark', language: 'xml'};
    }
  }
  apiDocumentation = pdqm
  capabilityStatement: any;

  fileUrl;

  constructor(
      private http: HttpClient,
      private config: ConfigService,
      private _dialogService: TdDialogService,
      private sanitizer: DomSanitizer
  ) { }

  ngAfterContentInit(): void {
    this.applyStatement('ukcorePatient')
  }



  applyStatement(option: string) {
    console.log(option)
    switch (option) {
      case 'PDQm': {
        this.data = JSON.stringify(pdqm,undefined,2)
        break
      }
      case 'SDCFormManager': {
        this.data = JSON.stringify(sdcFormManager,undefined,2)
        break
      }
      case 'MHDDocumentResponder': {
        this.data = JSON.stringify(mhdDocumentResponder,undefined,2)
        break
      }
      case 'mcsd': {
        this.data = JSON.stringify(mcsd,undefined,2)
        break
      }
      case 'ukcoreClinical': {
        this.data = JSON.stringify(ukcoreClinical,undefined,2)
        break
      }
      case 'ukcorePatient': {
        this.data = JSON.stringify(ukcorePatient,undefined,2)
        break
      }
    }
    this.showOAS()
  }
  showOAS() {
    this.oas = undefined
     if((this.data as string).startsWith('{')) {
       this.showOASHttp()
     } else {
      this.convertJSON()
     }
  }
  showOASHttp() {
    let headers = new HttpHeaders(
    );
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Accept', 'application/json');
    var url: string = this.config.validateUrl + '/R4/$openapi';

    this.http.post(url, this.data,{ headers}).subscribe(result => {
          this.oas = result
          const ui = SwaggerUI({
            spec: result,
            domNode: this.swagger?.nativeElement,
            deepLinking: true,
            presets: [
              SwaggerUI.presets.apis
            ],
          });
         this.swagger?.nativeElement.scrollIntoView({behavior: 'smooth'});
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
    var url: string = this.config.validateUrl + '/R4/$convert';
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

  downloadFile(data: Response) {
    // @ts-ignore
    const blob = new Blob([data], { type: 'text/csv' });
    const url= window.URL.createObjectURL(blob);
    window.open(url);
  }

  downloadOAS(): SafeResourceUrl {
    const data = JSON.stringify(this.oas,undefined,2);
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });

    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }
}
