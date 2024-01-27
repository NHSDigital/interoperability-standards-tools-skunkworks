import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent {
  editorOptions = {theme: 'vs-dark', language: 'json'};
  monacoEditor: any
  @ViewChild('myFormContainer', {static: false}) mydiv: ElementRef | undefined;
  data: any;

  checkType() {
    
  }

  onInit($event: any) {
    
  }
}
