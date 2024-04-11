const customReporter = {
  jasmineStarted: function (suiteInfo) {
    console.log(`Running ${suiteInfo.totalSpecsDefined} specs...`);
  },

  specDone: function (result) {
    if (result.status === 'failed') {
      console.log(`Failed: ${result.fullName}`);
      for (let i = 0; i < result.failedExpectations.length; i++) {
        console.log('Failure reason:', result.failedExpectations[i].message);
        console.log(result.failedExpectations[i].stack);
      }
    }
  },

  jasmineDone: function () {
    console.log('Finished suite');
  },
};

jasmine.getEnv().clearReporters(); // Remove default reporter
jasmine.getEnv().addReporter(customReporter);
