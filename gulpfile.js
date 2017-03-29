var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    package = require('./package.json'),
    gulp = require('gulp'),
    nunjucks = require('gulp-nunjucks'),
	nunjucksRender = require('gulp-nunjucks-render'),
    data = require('gulp-data'),
	fs = require('fs');


var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

gulp.task('css', function () {
    return gulp.src('src/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js',function(){
  gulp.src('src/js/scripts.js')
    .pipe(sourcemaps.init())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/assets/js'))
	  .on('error', swallowError)
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('nunjucks',function(){
	return gulp.src('src/pages/**/*.+(html|njk)')
		.pipe(data(function() {
			// return require('./src/data.json')
			return JSON.parse(fs.readFileSync('./src/data.json'));
		}))
		.pipe(nunjucksRender({
			path: ['src/templates']
		}))
		.on('error', swallowError)
		.pipe(gulp.dest('app'))
		.pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['nunjucks', 'css', 'js', 'browser-sync'], function () {
    gulp.watch("src/scss/*/*.scss", ['css']);
    gulp.watch("src/js/*.js", ['js']);
    gulp.watch("src/templates/*/*.*", ['nunjucks']);
    gulp.watch("src/templates/*.*", ['nunjucks']);
    gulp.watch("src/pages/*.*", ['nunjucks']);
    gulp.watch("src/*.json", ['nunjucks']);
    gulp.watch("app/*.html", ['bs-reload']);
});

function swallowError (error) {
	console.log(error.toString());
	this.emit('end');
}