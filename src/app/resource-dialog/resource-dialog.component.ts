import {Component, Inject, Input, OnInit} from '@angular/core';
import {FhirResource} from "fhir/r4";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ConfigService} from "../config.service";
import {TdDialogService} from "@covalent/core/dialogs";

declare var $: any;

@Component({
  selector: 'app-resource-viewer',
  templateUrl: './resource-dialog.component.html',
  styleUrls: ['./resource-dialog.component.css']
})
export class ResourceDialogComponent implements OnInit {



  constructor(
    public dialogRef: MatDialogRef<ResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private config: ConfigService,
    private _dialogService: TdDialogService,
    private http: HttpClient) {
    this.resource = data.resource;
  }

  @Input() resource: FhirResource | undefined;

  xml: string | undefined


  entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;'
  };

  ngOnInit(): void {
    console.log('Init Called TREE');
    this.convertJSON()
  }

  escapeHtml(source: string): string {
    // @ts-ignore
    return String(source).replace(/[&<>"'\/]/g, s => this.entityMap[s]);
  }

  protected readonly JSON = JSON;

  convertJSON() {
    let headers = new HttpHeaders(
    );
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Accept', 'application/xml');
    var url: string = this.config.validateUrl() + '/$convert';
    this.http.post(url, this.resource,{ responseType: 'text', headers}).subscribe(result => {
          if (result !== undefined) {
            this.xml = result as string
          }
        },
        error => {
          this._dialogService.openAlert({
            title: 'Alert',
            disableClose: true,
            message:
                this.config.getErrorMessage(error),
          });
        })
  }
}


