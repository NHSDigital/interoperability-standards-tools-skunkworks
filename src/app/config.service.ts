import { Injectable } from '@angular/core';
import {DatePipe} from "@angular/common";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  validateUrl() : string {
      console.log(window.location.href)
     if (environment.isDocker ) {
       let href=window.location.href
       if (href.endsWith("/")) {
         return href + "FHIR/R4"
       } else {
         return href + "/FHIR/R4"
       }
     }
      return environment.validateUrl
  }

  sdcServer() : string {
    return environment.sdcServer
  }

  openEHRServer() : string {
    return environment.openEHRServer
  }

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
