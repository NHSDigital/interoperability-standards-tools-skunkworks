export const environment = {
  production: true,
  validateUrl : 'http://localhost:9001/FHIR/R4',
  sdcServer : 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/FHIR/R4',
  openEHRServer : 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/openehr/openFHIR/R4',
  fhirserverbaseUrl: process.env["fhirserverbaseUrl"] || 'NK'
};
