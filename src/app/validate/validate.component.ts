import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import { DatePipe } from '@angular/common';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import { TdDialogService } from '@covalent/core/dialogs';
import {FhirResource} from "fhir/r4";

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss']
})
export class ValidateComponent implements OnInit {


    markdown = `TODO`
    resource: any = undefined ;

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                private _dialogService: TdDialogService) { }

    validate() {
        if (this.data !== undefined) this.resource = JSON.parse(this.data)
    }

    ngOnInit(): void {

    }

    getFHIRDateString(date : Date) : string {
        var datePipe = new DatePipe('en-GB');
        //2023-05-12T13:22:31.964Z
        var utc = datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSZZZZZ');
        if (utc!= null) return utc
        return date.toISOString()
    }

    showAlert(): void {
        this._dialogService.openAlert({
            title: 'BMI Risks',
            message:
                'For people of White heritage, a BMI:\n' +
                '\n' +
                'below 18.5 is underweight\n' +
                'between 18.5 and 24.9 is healthy\n' +
                'between 25 and 29.9 is overweight\n' +
                'of 30 or over is obese\n' +
                'Black, Asian and some other minority ethnic groups have a higher risk of developing some long-term conditions such as type 2 diabetes with a lower BMI. People from these groups with a BMI of:\n' +
                '\n' +
                '23 or more are at increased risk (overweight)\n' +
                '27.5 or more are at high risk (obese)',
        });
    }

    protected readonly JSON = JSON;
    data: any;

}
