import {Component, ElementRef, ViewChild} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
//import { JSDOM } from 'jsdom';
//import DOMPurify from 'dompurify';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent {
  editorOptions = {theme: 'vs-dark', language: 'markdown'};
  monacoEditor: any
  @ViewChild('myFormContainer', {static: false}) mydiv: ElementRef | undefined;
  data: any;
  markdown: string = "";
  icon = 'content_copy';
  iconText = 'Copy (as JSON string)'
  disabled: any;
  windows : any
  purify: any

  constructor(private sanitizer: DomSanitizer) {
  //  this.windows = new JSDOM('').window;
  //  this.purify = DOMPurify(this.windows);
  }

  async copy() {
    if (!navigator.clipboard) {
      throw new Error("Browser don't have support for native clipboard.");
    }
    let splitStrs= (this.data as string).split('\n')
    let singleStr = splitStrs.join('\\n')
    await navigator.clipboard.writeText(singleStr);
    console.log("Copied!!!");
    this.iconText = 'Copied'
    this.icon = 'content_paste'
  }
  checkType() {
    let splitStrs= (this.data as string).split('\\n')
    if (splitStrs.length >0) {
      console.log(splitStrs.join(','))
    //  this.data =this.Purify.sanitizer(splitStrs.join('\n'))
      this.data = splitStrs.join('\n')
    }
    this.markdown = this.data
  }

  sanitize(markdown) {

  }

  onInit($event: any) {

  }
}
