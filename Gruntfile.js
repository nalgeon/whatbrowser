module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        banner: [
            "/**",
            " <%= pkg.name %>, version <%= pkg.version %>",
            "",
            " <%= pkg.name %> is freely distributable under the terms of MIT-style license",
            " For details, see <%= pkg.homepage %>",
            "/\n"
        ].join("\n *"),

        babel: {
            options: {
                sourceMap: true,
                presets: ["es2015"]
            },
            dist: {
                files: {
                    "dist/whatbrowser.js": "src/whatbrowser.js"
                }
            }
        },

        eslint: {
            target: ["src/*.js"]
        },

        uglify: {
            options: {
                banner: "<%= banner %>",
                beautify: false,
                compress: false,
                mangle: false
            },
            website: {
                files: {
                    "dist/website.min.js": [
                        "dist/whatbrowser.js",
                        "src/hashcode.js",
                        "src/manager.js",
                        "src/main.js"
                    ]
                }
            },
            whatbrowser: {
                files: {
                    "dist/whatbrowser.min.js": ["dist/whatbrowser.js"]
                }
            }
        },

        concat: {
            all: {
                src: [
                    "lib/clipboard.min.js",
                    "lib/cookies-0.4.0.min.js",
                    "lib/jquery-3.4.1.min.js",
                    "lib/lz-string-1.3.3-min.js",
                    "lib/ua-parser-0.7.20.min.js",
                    "dist/website.min.js"
                ],
                dest: "dist/all.min.js"
            }
        },

        cssmin: {
            website: {
                files: {
                    "dist/website.min.css": [
                        "css/normalize-3.0.1.min.css",
                        "css/main.css"
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-babel");
    // grunt.registerTask('test', ['eslint']);
    // grunt.registerTask('default', ['eslint', 'uglify', 'concat', 'cssmin']);
    grunt.registerTask("default", ["babel", "uglify", "concat", "cssmin"]);
};
