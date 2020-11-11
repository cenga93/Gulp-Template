const { src, dest, series, watch } = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  plumber = require('gulp-plumber'),
  sassLint = require('gulp-sass-lint'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename'),
  browserSync = require('browser-sync').create(),
  iconfont = require('gulp-iconfont'),
  iconfontCss = require('gulp-iconfont-css'),
  svgSprite = require('gulp-svg-sprite');
// PATHS

const paths = {
  style: {
    src: './scss/**/*.scss',
    dest: `./assets/css`,
    watchFiles: './**/*.scss',
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

// WATCHING
const Watching = () => {
  const root = './';
  browserSync.init({ server: root });

  watch(paths.style.watchFiles, Style);
};

const build = series(SvgFont, Style, Watching);

exports.default = build;
