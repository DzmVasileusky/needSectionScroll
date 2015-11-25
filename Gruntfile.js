'use strict';

module.exports = function( grunt ) {

  // tasks
  grunt.initConfig({

    // move JS to dist
    copy: {
      main: {
        files: [
          {src: 'src/js/needsectionscroll.js', dest: 'dist/needsectionscroll.js', filter: 'isFile'}
        ]
      }
    },

    // minify JS
    uglify: {
      scripts: {
        files: {
          'dist/needsectionscroll.min.js': 'dist/needsectionscroll.js'
        }
      }
    },

    // compile LESS
    less: {
      styles: {
        options: {
          plugins: [
            require('less-plugin-glob')
          ]
        },
        files: {
          'dist/needsectionscroll.css': 'src/less/needsectionscroll.less'
        }
      }
    },

    // autoprefix CSS
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'Android 2', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie 7', 'ie 8', 'ie 9']
      },
      no_dest: {
        src: ['dist/needsectionscroll.css', 'dist/needsectionscroll.css']
      }
    },

    // beautify CSS
    csscomb: {
      styles: {
        options: {
          config: 'csscomb.json'
        },
        files: {
          'dist/needsectionscroll.css': 'dist/needsectionscroll.css'
        }
      }
    },

    // concat and minify CSS
    cssmin: {
      styles: {
        files: {
          'dist/needsectionscroll.min.css': 'dist/needsectionscroll.css'
        }
      }
    },

    // watch
    watch: {
      scripts: {
        files: ['src/js/*.js'],
        tasks: ['copy','uglify']
      },
      styles: {
        files: ['src/less/*.less'],
        tasks: ['less','autoprefixer', 'csscomb', 'cssmin']
      }
    },

    // local server
    connect: {
      server: {
        options: {
          port: 8000
        }
      }
    }

  });

  // download plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-csscomb');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // some default tasks
  grunt.registerTask('default', ['copy', 'uglify', 'less', 'autoprefixer', 'csscomb', 'cssmin']);
  grunt.registerTask('server', ['connect', 'watch']);

};
