module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-mocks.js',
      'GameLogic.js',
      'Test_GameLogic.js',
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'GameLogic.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    autoWatch : true,

    frameworks: ['jasmine'],

<<<<<<< HEAD
    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
=======
    browsers : ['Firefox'],

    plugins : [
            'karma-firefox-launcher',
>>>>>>> b832e7896dc8e327d5d27ca12880454a513dbcc1
            'karma-jasmine',
            'karma-coverage'
            ]

  });
<<<<<<< HEAD
};
=======
};
>>>>>>> b832e7896dc8e327d5d27ca12880454a513dbcc1
