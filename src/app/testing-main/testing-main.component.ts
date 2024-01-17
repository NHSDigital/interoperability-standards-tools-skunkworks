import { Component } from '@angular/core';
import {IMenuItem, IMenuTrigger} from "@covalent/core/dynamic-menu";

@Component({
  selector: 'app-testing-main',
  templateUrl: './testing-main.component.html',
  styleUrls: ['./testing-main.component.scss']
})
export class TestingMainComponent {
  trigger2: IMenuTrigger = {
    icon: 'code',
  };
  items2: IMenuItem[] = [
    {
      text: 'Testing App Source Code',
      link: 'https://github.com/NHSDigital/IOPS-Validation-UI'
    },
    {
      text: 'FHIR Validation Service Source Code',
      link: 'https://github.com/NHSDigital/IOPS-FHIR-Validation-Service'
    }
  ];
}
