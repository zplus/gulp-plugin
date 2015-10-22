var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();
plugins.browserSync = require('browser-sync');
plugins.sass = require('gulp-sass');

var basePath = 'src/';
var buildPath = 'dist/';
var paths = {
    js: [basePath + 'js/**/*.js'],
    sass: [basePath + 'scss/**/*.scss'],
    css: [basePath + 'css/**/*.css'],
    img: [basePath + 'images/**/*'],
    html: [basePath + '*.html'],
    lib: {
        js: [],
        css: [],
        img: []
    }
};

gulp.task('fileinclude', function () {
    gulp.src(paths.html)
        .pipe(plugins.fileInclude({
            prefix: '@@'
            , basepath: 'src/include' // 具体的地址 || @file
            , context: {
                name: 'test'
            }
        }))
        .pipe(gulp.dest(buildPath));
});

gulp.task('sass', function () {
    gulp.src(paths.sass)
        .pipe(plugins.sass({
            outputStyle: 'compressed'
        }).on('error', plugins.sass.logError))
        .pipe(gulp.dest(buildPath + basePath + 'css/'));
});

gulp.task('browser-sync', function () {
    var files = [
        paths.js[0],
        paths.sass[0],
        paths.css[0],
        paths.img[0],
        paths.html[0]
    ];

    plugins.browserSync.init(files, {
        server: {
            baseDir: './dist'
        }
    });
});


// watch
gulp.task('watch', function () {
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.img, ['img']);
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.html, ['fileinclude']);
});

gulp.task('default', ['browser-sync', 'watch', 'fileinclude', 'sass']);