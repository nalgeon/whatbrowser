module.exports = function(grunt){

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        banner: [
            '/**',
            ' <%= pkg.name %>, version <%= pkg.version %>',
            '',
            ' <%= pkg.name %> is freely distributable under the terms of MIT-style license',
            ' For details, see <%= pkg.homepage %>',
            '/\n'].join('\n *'),

        uglify: {
            options: {
                banner: '<%= banner %>',
                beautify: false,
                mangle: true
            },
            main: {
                files: {
                    'dist/main.min.js': ['src/whatbrowser.js', 'src/hashcode.js', 'src/manager.js', 'src/main.js'],
                }
            },
            whatbrowser: {
                files: {
                    'dist/whatbrowser.min.js': ['src/whatbrowser.js']
                }
            }
        },

        concat: {
            main: {
                src: ['lib/*.js', 'dist/main.min.js'],
                dest: 'dist/all.min.js'
            },
            whatbrowser: {
                src: ['lib/ua-parser-0.7.0.min.js', 'lib/swfobject-2.2.min.js', 'lib/deployjava.js', 'dist/whatbrowser.min.js'],
                dest: 'dist/whatbrowser.uber.js'
            }
        },

        cssmin: {
            main: {
                files: {
                    'dist/all.min.css': ['css/main.css', 'css/normalize-3.0.1.min.css']
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['uglify', 'concat', 'cssmin']);
};