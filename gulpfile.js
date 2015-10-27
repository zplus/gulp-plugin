var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();
plugins.browserSync = require('browser-sync');
plugins.sass = require('gulp-sass');
plugins.makeUrlVer = require('gulp-make-css-url-version');

var basePath = 'src/';
var buildPath = 'dist/';
var paths = {
    js: [basePath + 'js/**/*.js'],
    sass: [basePath + 'scss/**/*.scss'],
    css: [basePath + 'css/**/*.css'],
    img: [basePath + 'images/**/*'],
    svg: [basePath + 'svg/*.svg'],
    html: [basePath + '*.html'],
    lib: {
        js: [],
        css: [],
        img: []
    }
};

// todo
// html: 公用模块模版
// js,css sourceMap
// footer

/*******************************************************
 * html
 ******************************************************/
gulp.task('clean-html', function () {
    return gulp.src(buildPath + '**/*.html', {read: false})
        .pipe(plugins.clean());
});
gulp.task('html', ['clean-html'], function () {
    var options = {
        removeComments: true, // 清除HTML注释
        collapseWhitespace: false, // 压缩HTML
        collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
        minifyJS: true, // 压缩页面JS
        minifyCSS: true // 压缩页面CSS
    };
    return gulp.src(paths.html)
        .pipe(plugins.utf8Convert())
        .pipe(plugins.fileInclude({
            prefix: '@@'
            , basepath: 'src/include' // 具体的地址 || @file
            , context: {
                name: 'test'
            }
        }))
        .pipe(gulp.dest(buildPath))
        .pipe(plugins.processhtml())
        // revCollector
        /*
         .pipe(plugins.revCollector({
         replaceReved: true
         }))
         */
        .pipe(plugins.htmlmin(options))
        .pipe(gulp.dest(buildPath));
});

/*******************************************************
 * css
 ******************************************************/
gulp.task('clean-css', function () {
    return gulp.src(buildPath + basePath + 'css/*', {read: false})
        .pipe(plugins.clean());
});
gulp.task('css', ['clean-css'], function () {
    gulp.src(paths.sass)
        .pipe(plugins.utf8Convert())
        .pipe(plugins.sass({
            outputStyle: 'expanded' // compressed
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(buildPath + basePath + 'styles/'))
        .pipe(plugins.concat('main.css'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.makeUrlVer())
        .pipe(plugins.minifyCss({"compatibility": "ie7"}))
        .pipe(gulp.dest(buildPath + basePath + 'css/'));
});

/*******************************************************
 * js
 ******************************************************/
gulp.task('clean-js', function () {
    return gulp.src(buildPath + basePath + 'js/*', {read: false})
        .pipe(plugins.clean());
});
gulp.task('js', ['clean-js'], function () {
    return gulp.src(paths.js)
        .pipe(plugins.utf8Convert())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.concat('main.js'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.stripDebug())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(buildPath + basePath + 'js/'));
});


/*******************************************************
 * img
 * +++++++++++++++++++++++ BUG ++++++++++++++++++++++++
 * It's a bug with jpeg images
 ******************************************************/
gulp.task('img', function () {
    return gulp.src(paths.img, {base: './'})
        .pipe(plugins.cache(plugins.imagemin({
            optimizationLevel: 5 //类型：Number  默认：3  取值范围：0-7（优化等级）
            , progressive: true //类型：Boolean 默认：false 无损压缩jpg图片
            , interlaced: true //类型：Boolean 默认：false 隔行扫描gif进行渲染
            , multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
            , svgoPlugins: [{removeViewBox: false}]//不要移除svg的viewbox属性
        })))
        .pipe(gulp.dest(buildPath), {cwd: ''});
});


/*******************************************************
 * 保留hbs模板文件 todo
 ******************************************************/
gulp.task('hbs', function () {
    gulp.src('views/**/*.hbs').pipe(gulp.dest('public/views'));
    gulp.src('components/**/*.hbs').pipe(gulp.dest('public/components'));
});

gulp.task('clear', function (done) {
    return plugins.cache.clearAll(done);
});
gulp.task('cleanDist', function () {
    return gulp.src(buildPath + '*', {read: false})
        .pipe(plugins.clean());
});

gulp.task('browser-sync', function () {
    var files = [
        paths.js[0],
        paths.sass[0],
        paths.img[0],
        paths.html[0]
    ];

    plugins.browserSync.init(files, {
        server: {
            baseDir: 'dist'
        }
    });
});


// watch
gulp.task('watch', function () {
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.img, ['img']);
    gulp.watch(paths.sass, ['css']);
    gulp.watch(paths.html, ['html']);
});

gulp.task('default', ['browser-sync', 'watch', 'css', 'js', 'img', 'html']);