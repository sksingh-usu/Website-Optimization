module.exports = function(grunt) {

var mozjpeg = require('imagemin-mozjpeg');
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files:{
			  'prod/js/main.js': 'src/js/main.js',
			  'prod/js/perfmatters.js': 'src/js/perfmatters.js'
		  }
      }
    },
	jshint: {
		options: {
		  curly: true,
		  eqeqeq: true,
		  eqnull: true,
		  browser: true,
		},
		files:{
			  '/prod/js/main.js': '/src/js/main.js',
			  '/prod/js/perfmatters.js': '/src/js/perfmatters.js'
		}
    },	
	htmlmin: {
      options: {                                 
        removeComments: true,
        collapseWhitespace: true
      },
	  build:{
		files: {                                   
        '/prod/index.html': '/src/index.html',     
        '/prod/pizza.html': '/src/pizza.html'
			}  
		}
	},
	
	 cssmin: {
      options: {		  
        removeComments: true
      },
      build: {
        files: {
          'prod/css/style.css': 'src/css/style.css',
		  'prod/css/print.css': 'src/css/print.css',
		  'prod/css/style_homePage.css': 'src/css/style_homePage.css',
		  'prod/css/bootstrap-grid.css': 'src/css/bootstrap-grid.css'
        }
      }
    },	
	imagemin: { 
		options: {                       // Target options 
        optimizationLevel: 3,
        svgoPlugins: [{ removeViewBox: false }],
        use: [mozjpeg()]
      },
	   build: {
		  files: {                         
			'prod/images/pizzeria.jpg': 'src/images/pizzeria.jpg',
			'prod/images/profilepic.jpg': 'src/images/profilepic.jpg',
			'prod/images/course.jpg': 'src/images/course.jpg',
			'prod/images/mobile.jpg': 'src/images/mobile.jpg',
			'prod/images/udacity_pizzeria.jpg': 'src/images/udacity_pizzeria.jpg',
			'prod/images/moving-pizza.png': 'src/images/moving-pizza.png',
			'prod/images/pizza.png': 'src/images/pizza.png',
			
		  }
	   }
	}	
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-contrib-htmlmin");
  grunt.loadNpmTasks("grunt-contrib-imagemin");
  
  grunt.registerTask('default', ['jshint','htmlmin', 'cssmin','uglify', 'imagemin']); 
};