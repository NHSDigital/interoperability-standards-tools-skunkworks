import { Injectable } from '@angular/core';
import {DatePipe} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public validateUrl = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/FHIR/R4'
  //public validateUrl = 'http://localhost:9001/FHIR/R4'

  public sdcServer = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/FHIR/R4'

  getErrorMessage(error: any) {
    var errorMsg = ''
    if (error.error !== undefined){

      if (error.error.issue !== undefined) {
        errorMsg += ' ' + error.error.issue[0].diagnostics
      }
    }
    errorMsg += '\n\n ' + error.message
    return errorMsg;
  }

  getFHIRDateString(date : Date) : string {
    var datePipe = new DatePipe('en-GB');
    //2023-05-12T13:22:31.964Z
    var utc = datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSZZZZZ');
    if (utc!= null) return utc
    return date.toISOString()
  }
  constructor() { }
}
