var gulp = require('gulp'),
	rev = require('gulp-rev'),
	RevAll = require('gulp-rev-all'),
	merge = require('gulp-merge-json'),
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
	.pipe(gulp.dest('prebuild/css'))
	.pipe(cssnano())
	.pipe(rename({ suffix: '.min' }))
	.pipe(header(banner, { package : package }))
	// .pipe(rev())
	// .pipe(gulp.dest('app/assets/css'))
	// .pipe(rev.manifest('src/json/css_manifest.json', { base: 'css' }))
	// .pipe(gulp.dest('src/json'))
	.pipe(RevAll.revision({
		debug: true
	}))
    .pipe(gulp.dest('app/assets/css'))  
    .pipe(RevAll.manifestFile())
    .pipe(gulp.dest('src/json'))

	.pipe(sourcemaps.write())
	.pipe(gulp.dest('prebuild/css'))
	.pipe(browserSync.reload({stream:true}));
});

gulp.task('js',function(){
  gulp.src('src/js/scripts.js')
	.pipe(sourcemaps.init())
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter('default'))
	.pipe(header(banner, { package : package }))
	.pipe(gulp.dest('prebuild/js'))
	.pipe(uglify())
	.pipe(header(banner, { package : package }))
	.pipe(rename({ suffix: '.min' }))
	.pipe(gulp.dest('prebuild/js'))
	.pipe(rev())
	.pipe(gulp.dest('app/assets/js'))
	.pipe(rev.manifest('src/json/js_manifest.json', { base: 'src/json', merge: true }))
	.pipe(gulp.dest('src/json'))
	.pipe(sourcemaps.write())
	.on('error', swallowError)
	.pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('json_merge',function(){
	gulp.src('src/json/**/*.json')
		.pipe(merge({
			fileName: 'build.json',
			jsonReplacer: (key, value) => {
				if ( key === 'style.min.css' ) {
					this.styles_url = value;
					delete this[key];
					return this.styles_url;
				} else {
					return value;
				}
			}
		}))
		.pipe(gulp.dest('./src/json'));
});

gulp.task('nunjucks',function(){
	return gulp.src('src/pages/**/*.+(html|njk)')
		.pipe(data(function() {
			jObj = JSON.parse(fs.readFileSync('./src/json/data.json'));
			return jObj;
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
	gulp.watch("src/json/*.json", ['json_merge', 'nunjucks']);
	gulp.watch("app/*.html", ['bs-reload']);
});

function swallowError (error) {
	console.log(error.toString());
	this.emit('end');
}