export class AssessmentTest {
    '@': {
      'identifier': string; // Test.id
      'title': string;      // Test.name
      'xmlns': string;
      'xmlns:xsi': string;
      'xsi:schemaLocation': string;
    };
  
    'qti-test-part': {
      '@': {
        'identifier': 'testPart-1';
        'navigation-mode': string;
        'submission-mode': string;
      };
      'qti-assessment-section': {
          '@': {
              'identifier': 'assessmentSection-1';
              'title': 'Section 1';
              'visible': true;
          };
          '': {
            'qti-assessment-item-ref': {
              '@': {
                  'identifier': string;
                  'href': string;
              };
            };
          }[];
      };
    };

  
    constructor() {
      // TODO: proslediti u konstruktor neophodne objekte i pozvati privatne metode
    }
  
    private initRoot(testId: string, testName: string) {
      this["@"] = {
        'identifier': testId,
        'title': testName,
        // set default values
        'xmlns': 'http://www.imsglobal.org/xsd/imsqti_v3p0',
        "xmlns:xsi": 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsqti_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/xsd/imsqti_asiv3p0_v1p0.xsd',
      }
    }
  
    private initTestPart() {
      this["qti-test-part"] = {
        '@': {
          'identifier': 'testPart-1',
          'navigation-mode': 'nonlinear',
          'submission-mode': 'individual',
        },
        'qti-assessment-section': {
            '@': {
                'identifier': 'assessmentSection-1',
                'title': 'Section 1',
                'visible': true,
            },
            '': [] 
        },
      }
    }


    
}