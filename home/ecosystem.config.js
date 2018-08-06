module.exports = {
    apps : [ 
        Object.assign(
            require('/etc/ilp-connector/ilp-connector.conf.js'),
            { name: 'ilp-connector' }
        )
    ]
};