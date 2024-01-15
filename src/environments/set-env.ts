const setEnv = () => {
  // https://pazel.dev/how-to-keep-your-secrets-from-your-source-code-in-an-angular-project
  const fs = require('fs');
  const writeFile = fs.writeFile;
// Configure Angular `environment.ts` file path
  const targetPath = './src/environments/environment.ts';
// Load node modules
  const colors = require('colors');
  const appVersion = require('../../package.json').version;
  require('dotenv').config({
    path: 'src/environments/.env'
  });
// `environment.ts` file structure
  const envConfigFile = `export const environment = {
  production: true,
  conformanceServer: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/FHIR/R4',
  fhirServer: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/clinicaldatasharing/FHIR/R4',
  tieServer: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/FHIR/R4',
  directoryServer: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/caredirectories/FHIR/R4',
  stravaClientId: '${process.env.STRAVA_CLIENT}',
  stravaSecret: '${process.env.STRAVA_SECRET}',
  withingClientId: '${process.env.WITHINGS_CLIENT}',
  withingSecret: '${process.env.WITHINGS_SECRET}',
};
`;
  console.log(colors.magenta('The file `environment.ts` will be written with the following content: \n'));
  console.log(colors.grey(envConfigFile));
  writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(colors.magenta(`Angular environment.ts file generated correctly at ${targetPath} \n`));
    }
  });
};

setEnv();
