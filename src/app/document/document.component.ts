import {AfterContentInit, Component, ElementRef, SecurityContext, ViewChild} from '@angular/core';
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";
import {ConfigService} from "../config.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {TdDialogService} from "@covalent/core/dialogs";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import ips from 'src/app/document/FHIRDocument/Bundle-IPS-examples-Bundle-01.json'
import {Bundle, Composition, CompositionSection, FhirResource, Patient} from "fhir/r4";
@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent  implements AfterContentInit {
  editorOptions = {theme: 'vs-dark', language: 'json'};
  monacoEditor: any
  @ViewChild('myFormContainer', {static: false}) mydiv: ElementRef | undefined;
  data: any;

  markdown: string = "See [FHIR Document](https://hl7.org/fhir/R4/documents.html), [Internation Patient Summary](https://build.fhir.org/ig/HL7/fhir-ips/index.html) and [HL7 Europe Laboratory Report](https://build.fhir.org/ig/hl7-eu/laboratory/)."
  html = "<html>Copy FHIR document into editor</html>"
  resource: any;
  patient: Patient | undefined;
  composition: Composition | undefined;
  sections: CompositionSection[] = []

  constructor(private config: ConfigService,
              private http: HttpClient,
              private _dialogService: TdDialogService,
              protected sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              public dialog: MatDialog
  ) {

  }

  ngAfterContentInit(): void {
    this.data = JSON.stringify(ips, null, 2)
    this.resource = this.data
    this.checkType()
    }

  checkType() {
    try {
      this.patient = undefined
      this.composition = undefined
      this.sections = []
      this.resource = JSON.parse(this.data)
      if (this.resource.resourceType === 'Bundle') {
        const bundle = this.resource as Bundle
        if (bundle.entry !== undefined) {
          for (let entry of bundle.entry) {
            if (entry.resource !== null) {
              if (entry.resource?.resourceType === 'Patient') {
                this.patient = entry.resource as Patient

              } else if (entry.resource?.resourceType === 'Composition') {
                this.composition = entry.resource as Composition
                if (this.composition.section !== undefined) this.sections = this.composition.section
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  onInit($event: any) {
    
  }

  openInfo() {
    let dialogRef = this.dialog.open(InfoDiaglogComponent, {
      width: '400px',
      data:  this.markdown
    });

  }

  convertXML() {

/* Issues with XSLT conversion leave for now

    let headers = new HttpHeaders(
    );
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Accept', 'text/html');
    var url: string = this.config.validateUrl() + '/Composition/$convert';
    this.http.post(url, this.data,{ responseType: 'text', headers}).subscribe(xmlString => {
         this.html= xmlString
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

 */
  }

  showDocument() {
      this.checkType()
  }
}
