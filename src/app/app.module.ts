import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {CovalentDynamicFormsModule} from "@covalent/dynamic-forms";
import {CovalentLayoutModule} from "@covalent/core/layout";
import { CovalentMessageModule } from '@covalent/core/message';
import {CovalentMarkdownModule} from "@covalent/markdown";
import {CovalentHighlightModule} from "@covalent/highlight";
import { CovalentDialogsModule } from '@covalent/core/dialogs';
import {MatCardModule} from "@angular/material/card";
import {MatTableModule} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ValidateComponent} from "./validate/validate.component";
import {CovalentJsonFormatterModule} from "@covalent/core/json-formatter";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSortModule} from "@angular/material/sort";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatIconModule} from "@angular/material/icon";
import { TestingMainComponent } from './testing-main/testing-main.component';
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {CovalentDynamicMenuModule} from "@covalent/core/dynamic-menu";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltipModule} from "@angular/material/tooltip";
import {CovalentLoadingModule} from "@covalent/core/loading";
import { InformationComponent } from './information/information.component';
import {MatListModule} from "@angular/material/list";
import {CovalentFileModule} from "@covalent/core/file";

@NgModule({
  declarations: [
    AppComponent,
    ValidateComponent,
    TestingMainComponent,
    InformationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CovalentLayoutModule,
    FormsModule,

    // (optional) Additional Covalent Modules imports
    CovalentDynamicFormsModule,
    CovalentHighlightModule,
    CovalentMarkdownModule,
    CovalentMessageModule,
    CovalentDialogsModule,
    CovalentJsonFormatterModule,
    CovalentLoadingModule,
    MatCardModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatSortModule,
    MatGridListModule,
    MatIconModule,
    MonacoEditorModule.forRoot(),
    CovalentDynamicMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatListModule,
    CovalentFileModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
