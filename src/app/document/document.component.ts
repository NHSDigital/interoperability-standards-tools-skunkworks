import {AfterContentInit, Component, ElementRef, SecurityContext, ViewChild} from '@angular/core';
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";
import {ConfigService} from "../config.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {TdDialogService} from "@covalent/core/dialogs";
import {ActivatedRoute} from "@angular/router";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import ips from 'src/app/document/FHIRDocument/Bundle-IPS-examples-Bundle-01.json'
import {Bundle, Composition, CompositionSection, FhirResource, Patient, Reference} from "fhir/r4";
import {ResourceDialogComponent} from "../resource-dialog/resource-dialog.component";
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

  // @ts-ignore
  composition: Composition;


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
      // @ts-ignore
      this.composition = undefined

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

  select(entry: any): void {
    if (this.resource !== undefined && this.resource.resourceType === 'Bundle') {
      let bundle = this.resource as Bundle
      let refs = (entry as Reference).reference?.split("/")
      if (refs !== undefined && refs.length > 1 && bundle.entry !== undefined) {
        for (let ent of bundle.entry) {
          if (ent.fullUrl !== undefined && ent.fullUrl.includes(refs[1])) {
            const dialogConfig = new MatDialogConfig();
            let resource = ent.resource
            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;
            dialogConfig.data = {
              id: 1,
              resource
            };
            const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open(ResourceDialogComponent, dialogConfig);
          }
        }
      }
    }
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
