const { src, dest, series, watch } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const sassLint = require('gulp-sass-lint');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
const svgSprite = require('gulp-svg-sprite');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const del = require('del');

const paths = {
  style: {
    src: './scss/**/*.scss',
    dest: `./assets/css`,
    watchFiles: './**/*.scss',
  },
  js: {
    src: './js/**/*.js',
    dest: './assets/js',
    watchFiles: './js/**/*.js',
  },
  icons: {
    src: 'assets/svg/*.svg',
    dest: 'assets/fonts/',
  },
  sprite: {
    src: 'assets/svg/*',
    svg: '../../assets/sprite/sprite',
    config: 'config/sprite.scss',
    dest: 'scss/',
  },
  sassConfigFile: '.sass-lint.yml',
};

// STYLE -> CONVERT SCSS TO CSS
const Style = () => {
  return src(paths.style.src)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(
      sassLint({
        options: {
          configFile: '.sass-lint.yml',
        },
      })
    )
    .pipe(sassLint.format())
    .pipe(sass.sync({ outputStyle: 'compressed' }))
    .on('error', sass.logError)
    .pipe(
      rename({
        basename: 'app',
        suffix: '.min',
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(dest(paths.style.dest))
    .pipe(browserSync.stream());
};

// JAVASCRIPT -> CONVERT WITH BABEL
const Script = () => {
  return src(paths.js.src)
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(uglify())
    .pipe(
      rename({
        basename: 'app',
        suffix: '.min',
      })
    )

    .pipe(sourcemaps.write('./'))
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream());
};

// ICON FONT -> CONVERT SVG ICONS TO FONT SVG ICONS
const SvgFont = () => {
  return src(paths.icons.src)
    .pipe(
      iconfontCss({
        fontName: 'svg-icons',
        cssClass: 'icon',
        path: 'config/icon-font.scss',
        targetPath: '../../scss/fonts/_icon-font.scss',
        fontPath: '../fonts/',
      })
    )
    .pipe(
      iconfont({
        fontName: 'svgicons',
        prependUnicode: false,
        formats: ['ttf', 'woff'],
        normalize: true,
        centerHorizontally: true,
      })
    )
    .pipe(dest(paths.icons.dest));
};

// SVG SPRITE
const Sprite = () => {
  return src(paths.sprite.src)
    .pipe(
      svgSprite({
        shape: {
          spacing: {
            padding: 10,
          },
        },
        mode: {
          css: {
            dest: 'sprite/',
            layout: 'vertical',
            sprite: paths.sprite.svg, //sprite koji ce se izgenerisati (.svg )
            bust: false,
            render: {
              scss: {
                dest: 'sprite/',
                template: paths.sprite.config, //template
              },
            },
          },
        },
        variables: {
          mapname: 'icons',
        },
      })
    )
    .pipe(dest(paths.sprite.dest));
};

const Clean = () => {
  return del(['assets/css', 'assets/js', 'assets/fonts', 'assets/sprite', 'scss/fonts', 'scss/sprite'], { force: true });
};

// WATCHING
const Watching = () => {
  const root = './';
  browserSync.init({ server: root });

  watch(paths.style.watchFiles, Style);
};

const build = series(Clean, Style, Script, SvgFont, Sprite, Watching);

exports.default = build;
