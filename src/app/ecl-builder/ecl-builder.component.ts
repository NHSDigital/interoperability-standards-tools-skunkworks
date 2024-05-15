import {Component, ViewChild} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {MatButton} from "@angular/material/button";
import {ConceptDisplayComponent} from "../concept/concept-display/concept-display.component";
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatPaginator} from "@angular/material/paginator";
import {NgIf} from "@angular/common";
import {Coding, QuestionnaireItemAnswerOption, ValueSet} from "fhir/r4";
import {ConfigService} from "../config.service";
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-ecl-builder',
  standalone: true,
    imports: [
        MatCard,
        MatLabel,
        MatCardContent,
        MatCardHeader,
        MatFormField,
        MatInput,
        CdkTextareaAutosize,
        MatButton,
        ConceptDisplayComponent,
        MatCell,
        MatCellDef,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderRow,
        MatHeaderRowDef,
        MatIcon,
        MatPaginator,
        MatRow,
        MatRowDef,
        MatTableModule,
        NgIf,
        FormsModule
    ],
  templateUrl: './ecl-builder.component.html',
  styleUrl: './ecl-builder.component.scss'
})
export class EclBuilderComponent {

    displayedColumns: string[] = ['code', 'display', ];


    dataSource: MatTableDataSource<Coding> = new MatTableDataSource<Coding>([]);

    @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
    ecl: any;
    answerValueSetURI: string | undefined

    constructor(private config: ConfigService,
                private http: HttpClient,
                public dialog: MatDialog
    ) {
    }
    execute() {
        this.dataSource = new MatTableDataSource<Coding>([]);
        if (this.ecl !== undefined) {
            var worker = ''
            // remove comments
            let ecls = this.ecl.split('|')
            var index = 0
            ecls.forEach(value => {
                if ((index % 2) == 0) {
                    worker += value.replace(' ','')
                }
                index++
            })

            console.log(worker)
            this.answerValueSetURI = 'http://snomed.info/sct/900000000000207008?fhir_vs=ecl%2F'+encodeURI(worker)

            this.http.get(this.config.sdcServer() + '/ValueSet/\$expand?url=' + this.answerValueSetURI).subscribe((result) => {
                    const valueSet = result as ValueSet
                    if (valueSet.resourceType === 'ValueSet') {

                        if (valueSet.expansion !== undefined && valueSet.expansion.contains !== undefined && valueSet.expansion.contains.length > 0) {
                            var answers: Coding[] = []
                            for (let entry of valueSet.expansion.contains) {
                                const answer: Coding = {
                                    code: entry.code,
                                    system: entry.system,
                                    display: entry.display
                                }
                                answers.push(answer)
                            }

                            this.dataSource = new MatTableDataSource<Coding>(answers)
                            if (this.paginator !== undefined) this.dataSource.paginator = this.paginator
                        }
                    }
                },
                (error) => {
                    console.log(error)
                    this.openAlert('Alert',this.config.getErrorMessage(error) )
                })
        }
    }
    openAlert(title : string, information : string) {
        let dialogRef = this.dialog.open(InfoDiaglogComponent, {
            width: '400px',
            data:  {
                information: information,
                title: title
            }
        });

    }
}
