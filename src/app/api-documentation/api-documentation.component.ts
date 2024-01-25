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
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {
  Bundle,
  CapabilityStatement,
  CapabilityStatementMessagingSupportedMessage,
  CapabilityStatementRestResource,
  ImplementationGuide
} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
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
  editorOptions = {theme: 'vs-dark', language: 'json'};

  markdown = `This page is only designed for CapabilityStatements which include [FHIR Interactions](https://hl7.org/fhir/R4/exchange-module.html) or Open API Specification (OAS). \nEither paste in the JSON/XML/YAML resource or select a starter from the list below.`
  onInit(editor) {
    this.monacoEditor = editor
  }

  @ViewChild('swagger',{static: true}) swagger: ElementRef | undefined

  apiDocumentation = pdqm
  capabilityStatement: any;

  fileUrl;

  constructor(
      private http: HttpClient,
      private route: ActivatedRoute,
      private router: Router,
      private config: ConfigService,
      private _dialogService: TdDialogService,
      private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.router.events.forEach((event) => {
      if(event instanceof NavigationStart
      ) {
        console.log('CHANGE')
        this.oasOnly = false
      }
      // NavigationEnd
      // NavigationCancel
      // NavigationError
      // RoutesRecognized
    });
    this.route.queryParamMap.subscribe(params => {
      const urlParam = params.get('url');

      if (urlParam !== undefined) {
        this.http.get(this.config.validateUrl + '/R4/CapabilityStatement?url='+decodeURI(urlParam as string)).subscribe((result) => {

              if (result !== undefined) {
                let bundle = result as Bundle
                if (bundle.entry !== undefined && bundle.entry.length>0) {
                   this.data = JSON.stringify(bundle.entry[0].resource, undefined,2)
                  this.oasOnly = true
                  if (this.data !== undefined) this.showOAS()
                }
              }
            }
        )
      } else {
        this.oasOnly = false
      }
    });
  }

  ngAfterContentInit(): void {
    if (!this.oasOnly) {
      this.applyStatement('ukcoreClinical')
    } else {

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
      if ((this.data as string).startsWith('openapi')) {
        if (this.editorOptions.language !== 'yaml') this.editorOptions.language = 'yaml';
        this.oasInput = true
      } else {
        if (this.editorOptions.language !== 'xml') this.editorOptions.language = 'xml';
      }
    }
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
    var url: string = this.config.validateUrl + '/R4/$convertOAS';


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
    console.log(spec)
    try {
      var fixServer = spec as any
      console.log(fixServer)
      if (fixServer.openapi !== undefined && (fixServer.servers === undefined || fixServer.servers.length ===0 || fixServer.servers[0].url === undefined)) {
        fixServer.servers = [
          {
            "url": "https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/clinicaldatasharing/FHIR/R4",
            "description": "Proof of Concept FHIR Reference Implementation Server (AWS FHIRWorks)"
          }
        ]
        spec = fixServer
      }
    } catch (e) {

    }
    const ui = SwaggerUI({
      spec: spec,
      domNode: this.swagger?.nativeElement,
      deepLinking: true,
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
    var url: string = this.config.validateUrl + '/R4/CapabilityStatement/$openapi';

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

  convertoFHIR() {
    let headers = new HttpHeaders(
    );
    if (this.editorOptions.language === 'yaml') {
      headers = headers.append('Content-Type', 'application/x-yaml');
    } else {
      headers = headers.append('Content-Type', 'application/json');
    }
    headers = headers.append('Accept', 'application/json');
    var url: string = this.config.validateUrl + '/R4/$convertOAStoFHIR';
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
}
