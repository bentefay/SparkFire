require.config({
    /* urlArgs: "cachebust=" + (new Date()).getTime() ,*/
    paths: {
        /* Prefixing paths with '..' is not supported, so prefix with a known folder. */
    },
    map: {
        '*': {
            'text': 'require/plugins/text'
        }
    },
    deps: [ "index" ]
});