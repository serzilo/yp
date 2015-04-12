'use strict';

var gulp = require('gulp'),
	watch = require('gulp-watch'),
	stylus = require('gulp-stylus'),
	rigger = require('gulp-rigger'),
	prefixer = require('gulp-autoprefixer'),
	cssmin = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	browserSync = require("browser-sync"),
	spritesmith = require('gulp.spritesmith'),
    reload = browserSync.reload;


var path = {
    build: {
        html: 'build/',
        js:   'build/js/',
        css:  'build/css/',
        img:  'build/img/'
    },
    src: {
        html:   'src/html/*.html',
        js:     'src/js/main.js',
        css:    'src/css/main.styl',
        img:    'src/img/**/*.*'
    },
    watch: {
        html:  'src/html/*.html',
        js:    'src/js/*.js',
        css:   'src/css/main.styl',
        img:   'src/img/**/*.*'
    }
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Local host"
};

gulp.task('html:build', function () {
    gulp.src(path.src.html)
    	.pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('css:build', function () {
    gulp.src(path.src.css)
        .pipe(stylus())
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('sprite:build', function () {
	var spriteData = gulp.src(path.src.img).pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css',
		imgPath: '../img/sprite.png'
	}));
	spriteData.img.pipe(gulp.dest(path.build.img));
	spriteData.css.pipe(cssmin()).pipe(gulp.dest(path.build.css));
});

gulp.task('build', [
    'html:build',
    'sprite:build',
    'css:build',
    'js:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start('css:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('sprite:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('default', ['build', 'webserver', 'watch']);