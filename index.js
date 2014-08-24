'use strict';

var gutil = require('gulp-util'),
    Buffer = require('buffer').Buffer,
    PluginError = gutil.PluginError,
    File = gutil.File,
    path = require('path'),
    through = require('event-stream').through,
    _ = require('lodash');

var jsTpl = _.template('<%_.each(paths, function(p){ %> document.write(\'<script src="<%= p %>"></script>\');\n <% }); %>'),
    cssTpl = _.template('<%_.each(paths, function(p){ %> @import url(<%= p %>);\n <% }); %>');

function fileInclusion(fileName, opt) {

    if (!fileName) throw new PluginError('gulp-include', 'Missing fileName option for gulp-concat');
    if (!opt) opt = {};

    var files = [],
        tpl = opt.type == 'css' ? cssTpl : jsTpl,
        base = opt.base;

    function onData(file) {
        if (file.isNull()) return; // ignore
        if (file.isStream()) return this.emit('error', PluginError('gulp-include',  'Streaming not supported'));

        if(base){
            file.base = base;
        }

        files.push(file);

        //console.log(_.pick(file, ['base', 'path', 'relative', 'cwd']));

        this.emit('data', file);
    }

    function onEnd() {

        if (files.length) {

            var firstFile = files[0],
                paths = files.map(function(f){
                    return f.relative.replace(/\\/g, '/');
                }),
                file = new File({
                    cwd: firstFile.cwd,
                    base: firstFile.base,
                    path: path.join(firstFile.base, fileName),
                    contents: new Buffer(tpl({paths: paths})),
                    stat: firstFile.stat
                });

            this.emit('data', file);
        }

        this.emit('end');
    }

    return through(onData, onEnd);
};


module.exports = fileInclusion;

