const gulp = require('gulp')
const spawn = require('child_process').spawn

var paths = {
  src: ['./src/**/*.ts'],
  spec: ['./spec/**/*.spec.ts']
}

gulp.task('test', function (done) {
  let testProcess = spawn('npm', ['test'], { shell: true, stdio: 'inherit' })
  // options tirées dehttps://stackoverflow.com/questions/7725809/preserve-color-when-executing-child-process-spawn
  testProcess.on('error', (error) => console.error('error Error!', error))
  testProcess.on('exit', (code, signal) => done())
})

gulp.task('watch', ['test'], function () {
  gulp.watch([paths.src, paths.spec], ['test'])
})
