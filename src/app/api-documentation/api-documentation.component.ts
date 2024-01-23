import {AfterContentInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import pdqm from './pdqm.json'
import SwaggerUI from 'swagger-ui';
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
  monacoEditor : any
  editorOptions = {theme: 'vs-dark', language: 'json'};
  onInit(editor) {
    this.monacoEditor = editor
  }

  @ViewChild('swagger',{static: true}) custApiDocElement: ElementRef | undefined
  checkType() {

  }
  apiDocumentation = pdqm
  ngAfterContentInit(): void {
    console.log(this.custApiDocElement)
    const ui = SwaggerUI({
      url: 'http://petstore.swagger.io/v2/swagger.json',
      domNode: this.custApiDocElement?.nativeElement,
      deepLinking: true,
      presets: [
        SwaggerUI.presets.apis
      ],
    });
  }
}
