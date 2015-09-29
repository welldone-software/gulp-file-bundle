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

const PLUGIN_NAME = 'gulp-file-bundle';

function fileInclusion(bundleName, opts) {

    if (!bundleName) {
        throw new PluginError(PLUGIN_NAME, 'Missing bundleName argument');
    }

    opts = _.defaults(opts, {
        type : 'js',
        base : undefined,
        emitInputFiles: true
    });
    
    var files = [],
        tpl = opts.type == 'css' ? cssTpl : jsTpl,
        base = opts.base;

    function onData(file) {
        
        if (file.isNull()) {
            return; // ignore
        }
        
        if (file.isStream()){
            return this.emit('error', PluginError(PLUGIN_NAME,  'Streaming not supported'));
        }

        if(base){
            file.base = base;
        }

        files.push(file);

        if(opts.emitInputFiles){
            this.emit('data', file);
        }
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
                    path: path.join(firstFile.base, bundleName),
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

